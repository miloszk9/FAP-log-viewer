import React, { useCallback, useId, useMemo, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);

  return `${value.toFixed(value < 10 && exponent > 0 ? 1 : 0)} ${units[exponent]}`;
};

const normalizeAcceptList = (accept: readonly string[]): readonly string[] => {
  return accept.map((item) => item.trim().toLowerCase()).filter((item) => item.length > 0);
};

const fileMatchesAccept = (file: File, accept: readonly string[]): boolean => {
  const normalizedAccept = normalizeAcceptList(accept);

  if (!normalizedAccept.length) {
    return true;
  }

  const mimeType = file.type.toLowerCase();
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "" : "";

  return normalizedAccept.some((entry) => {
    if (entry.startsWith(".")) {
      return extension === entry.slice(1);
    }

    if (entry.includes("/")) {
      return entry === mimeType || (entry.endsWith("/*") && mimeType.startsWith(entry.replace("/*", "/")));
    }

    return false;
  });
};

interface FileDropzoneProps {
  accept: readonly string[];
  maxSizeBytes: number;
  onFileAccepted: (file: File) => void;
  onValidationError?: (message: string | null) => void;
  onClear?: () => void;
  selectedFile?: File | null;
  errorMessage?: string | null;
  isDisabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  maxSizeBytes,
  onFileAccepted,
  onValidationError,
  onClear,
  selectedFile,
  errorMessage,
  isDisabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneId = useId();

  const acceptedList = useMemo(() => normalizeAcceptList(accept), [accept]);

  const validateAndHandleFile = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) {
        onValidationError?.(null);
        return;
      }

      const file = fileList[0];

      if (!fileMatchesAccept(file, acceptedList)) {
        onValidationError?.("Unsupported file type. Upload CSV or ZIP files only.");
        return;
      }

      if (file.size > maxSizeBytes) {
        onValidationError?.("File is too large. Maximum size is 20MB.");
        return;
      }

      onValidationError?.(null);
      onFileAccepted(file);
    },
    [acceptedList, maxSizeBytes, onFileAccepted, onValidationError]
  );

  const handleOpenFileDialog = useCallback(() => {
    if (isDisabled) {
      return;
    }

    inputRef.current?.click();
  }, [isDisabled]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (isDisabled) {
        return;
      }

      setIsDragging(false);
      validateAndHandleFile(event.dataTransfer?.files ?? null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [isDisabled, validateAndHandleFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    setIsDragging(true);
  }, [isDisabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleOpenFileDialog();
      }
    },
    [handleOpenFileDialog, isDisabled]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) {
        return;
      }

      validateAndHandleFile(event.target.files);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [isDisabled, validateAndHandleFile]
  );

  const dropzoneClasses = cn(
    "relative flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition",
    isDisabled
      ? "cursor-not-allowed border-muted-foreground/40 bg-muted/20 text-muted-foreground"
      : "cursor-pointer border-muted-foreground/40 bg-muted/10 hover:border-primary/50 hover:bg-primary/5",
    isDragging && !isDisabled ? "border-primary bg-primary/5" : null
  );

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        className={dropzoneClasses}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        onClick={handleOpenFileDialog}
        aria-disabled={isDisabled}
        aria-describedby={`${dropzoneId}-hint`}
        aria-label="Upload a CSV or ZIP log file"
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedList.join(",")}
          onChange={handleInputChange}
          className="hidden"
          disabled={isDisabled}
        />
        <UploadCloud aria-hidden className="h-12 w-12 text-primary" />
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">Drag and drop your log file</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>
        <p id={`${dropzoneId}-hint`} className="text-xs text-muted-foreground">
          We accept CSV or ZIP files up to {formatBytes(maxSizeBytes)}.
        </p>
        {selectedFile ? (
          <div className="flex max-w-full flex-col items-center gap-2 rounded-md border border-muted-foreground/20 bg-background/90 p-3 text-sm shadow-sm">
            <div className="flex w-full flex-col gap-1">
              <span className="font-medium text-foreground" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</span>
            </div>
            {onClear ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-xs"
                onClick={(event) => {
                  event.stopPropagation();
                  onValidationError?.(null);
                  onClear();
                }}
              >
                <X aria-hidden className="h-3.5 w-3.5" />
                Remove file
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div aria-live="assertive" className="min-h-[1.25rem] text-sm">
        {errorMessage ? <span className="text-destructive">{errorMessage}</span> : null}
      </div>
    </div>
  );
};

