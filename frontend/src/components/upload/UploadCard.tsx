import React, { useCallback, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { useUploadAnalysis } from "@/lib/queries";
import { ApiError } from "@/lib/apiClient";
import type { ConflictExistingAnalysisDto } from "@/types";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const ACCEPTED_FILE_TYPES = Object.freeze([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/zip",
  "application/x-zip-compressed",
  ".csv",
  ".zip",
]);

type UploadFeedback =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { type: "conflict"; message: string; analysisId: string | null };

const getConflictId = (error: ApiError): string | null => {
  if (!error || error.status !== 409) {
    return null;
  }

  const payload = error.payload as ConflictExistingAnalysisDto | null;

  if (payload && typeof payload === "object" && typeof payload.id === "string") {
    return payload.id;
  }

  return null;
};

const getErrorMessage = (error: ApiError): string => {
  if (error.status === 409) {
    return error.message || "A previous analysis exists for this file.";
  }

  if (error.status === 400) {
    return error.message || "Upload failed due to invalid file. Verify the file type and size.";
  }

  if (error.status >= 500) {
    return "The server is currently unavailable. Please retry in a moment.";
  }

  if (error.status === 0) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return error.message || "Upload failed. Please try again.";
};

export const UploadCard: React.FC = () => {
  const uploadMutation = useUploadAnalysis();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<UploadFeedback | null>(null);

  const isUploading = uploadMutation.isPending;

  const hintText = useMemo(() => {
    return "Files must be exported from the FAP mobile app. Only CSV or ZIP archives up to 20MB are accepted.";
  }, []);

  const clearStatus = useCallback(() => {
    setValidationError(null);
    setFeedback(null);
  }, []);

  const handleFileAccepted = useCallback(
    (file: File) => {
      setSelectedFile(file);
      clearStatus();
      uploadMutation.reset();
    },
    [clearStatus, uploadMutation]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedFile(null);
    clearStatus();
    uploadMutation.reset();
  }, [clearStatus, uploadMutation]);

  const handleValidationError = useCallback((message: string | null) => {
    setValidationError(message);

    if (message) {
      setFeedback(null);
    }
  }, []);

  const handleNavigate = useCallback((path: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.location.assign(path);
  }, []);

  const handleUpload = useCallback(() => {
    if (!selectedFile) {
      setValidationError("Select a CSV or ZIP file before uploading.");
      setFeedback(null);
      return;
    }

    setValidationError(null);
    setFeedback(null);

    uploadMutation.mutate(
      { file: selectedFile },
      {
        onSuccess: (data) => {
          setSelectedFile(null);

          const queuedCount = Array.isArray(data.ids) ? data.ids.length : 0;
          const message =
            queuedCount > 1
              ? `Uploaded successfully. ${queuedCount} analyses were queued. Redirecting to history…`
              : "Uploaded successfully. Redirecting to history…";

          setFeedback({ type: "success", message });

          setTimeout(() => {
            handleNavigate("/history");
          }, 800);
        },
        onError: (error) => {
          if (!(error instanceof ApiError)) {
            setFeedback({ type: "error", message: "Upload failed. Please try again." });
            return;
          }

          const conflictId = getConflictId(error);

          if (error.status === 409) {
            setFeedback({
              type: "conflict",
              message: getErrorMessage(error),
              analysisId: conflictId,
            });
            return;
          }

          setFeedback({ type: "error", message: getErrorMessage(error) });
        },
      }
    );
  }, [handleNavigate, selectedFile, uploadMutation]);

  const renderFeedback = () => {
    if (!feedback) {
      return null;
    }

    if (feedback.type === "success") {
      return (
        <div
          className="flex items-start gap-3 rounded-md border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm"
          role="status"
        >
          <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 text-emerald-600" />
          <span className="text-emerald-700 dark:text-emerald-300">{feedback.message}</span>
        </div>
      );
    }

    if (feedback.type === "conflict") {
      return (
        <div
          className="flex flex-col gap-3 rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-sm"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 text-amber-600" />
            <span className="text-amber-700 dark:text-amber-300">{feedback.message}</span>
          </div>
          {feedback.analysisId ? (
            <div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleNavigate(`/analyses/${feedback.analysisId}`)}
              >
                View existing analysis
              </Button>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div
        className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm"
        role="alert"
      >
        <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 text-destructive" />
        <span className="text-destructive/80">{feedback.message}</span>
      </div>
    );
  };

  return (
    <Card className="border-muted-foreground/30 bg-background/70 backdrop-blur">
      <CardHeader>
        <CardTitle>Upload a new log</CardTitle>
        <CardDescription>{hintText}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileDropzone
          accept={ACCEPTED_FILE_TYPES}
          maxSizeBytes={MAX_FILE_SIZE_BYTES}
          onFileAccepted={handleFileAccepted}
          onValidationError={handleValidationError}
          onClear={selectedFile ? handleClearSelection : undefined}
          selectedFile={selectedFile ?? undefined}
          errorMessage={validationError}
          isDisabled={isUploading}
        />

        <div aria-live="polite" className="space-y-3">
          {renderFeedback()}
        </div>

        <section className="rounded-lg border border-muted-foreground/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Before uploading</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Ensure the file contains a single trip exported from the mobile app.</li>
            <li>Do not modify the CSV headers or ZIP contents before uploading.</li>
            <li>Each file can be queued once; duplicates redirect you to the existing analysis.</li>
          </ul>
        </section>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-muted-foreground/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            className="sm:min-w-[160px]"
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? "Uploading…" : "Upload file"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="sm:min-w-[120px]"
            onClick={handleClearSelection}
            disabled={isUploading || !selectedFile}
          >
            Clear
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
