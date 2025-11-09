import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

import { AuthPage } from "../pages/auth.page";
import { DashboardPage } from "../pages/dashboard.page";
import { HistoryPage } from "../pages/history.page";
import { UploadPage } from "../pages/upload.page";
import { AUTH_TEST_EMAIL, AUTH_TEST_PASSWORD } from "../utils/constants";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SINGLE_LOG_FILE_NAME = "DCM62v2_20250203.csv";
const SINGLE_LOG_FILE_PATH = path.resolve(__dirname, "../sample_logs", SINGLE_LOG_FILE_NAME);

test.describe("Upload single log", () => {
  test("uploads a single CSV log and shows it in history", async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);
    const uploadPage = new UploadPage(page);
    const historyPage = new HistoryPage(page);
    const email = AUTH_TEST_EMAIL;
    const password = AUTH_TEST_PASSWORD;

    await test.step("Navigate to login page", async () => {
      await authPage.navigateToLogin();
    });

    await test.step("Ensure the test account exists", async () => {
      await authPage.navigateToRegister();
      const registrationResult = await authPage.register(email, password);

      if (registrationResult === "error") {
        await authPage.clickSignInLink();
      }
    });

    await test.step("Login with test credentials", async () => {
      await authPage.login(email, password);
      await dashboardPage.waitForDashboard();
    });

    await test.step("Navigate to the upload page", async () => {
      await dashboardPage.navigateToUpload();
      await uploadPage.waitForUploadForm();
    });

    await test.step("Upload the CSV log file", async () => {
      await uploadPage.selectFile(SINGLE_LOG_FILE_PATH);
      await uploadPage.submitUpload();
      await uploadPage.waitForSuccessAndRedirect();
    });

    await test.step("Verify the uploaded log appears in history", async () => {
      await historyPage.waitForHistoryPage();
      const analysisItem = await historyPage.waitForAnalysisItem(SINGLE_LOG_FILE_NAME);
      await expect(analysisItem).toContainText(SINGLE_LOG_FILE_NAME);
    });

    await test.step("Sign out from the application", async () => {
      await dashboardPage.signOut();
      await authPage.waitForLoginForm();
    });
  });
});
