import { expect, test } from "@playwright/test";

import { AuthPage } from "../pages/auth.page";
import { DashboardPage } from "../pages/dashboard.page";
import { HistoryPage } from "../pages/history.page";
import { AnalysisPage } from "../pages/analysis.page";
import { AUTH_TEST_EMAIL, AUTH_TEST_PASSWORD } from "../utils/constants";

const SINGLE_LOG_FILE_NAME = "DCM62v2_20250203.csv";

test.describe("Check single analysis", () => {
  test("displays detailed analysis with all sections when clicking on a successful analysis", async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);
    const historyPage = new HistoryPage(page);
    const analysisPage = new AnalysisPage(page);
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

    await test.step("Navigate to history page", async () => {
      await dashboardPage.navigateToHistory();
      await historyPage.waitForHistoryPage();
    });

    await test.step("Verify the analysis has Success status and no FAP regeneration flag", async () => {
      await historyPage.expectAnalysisStatus(SINGLE_LOG_FILE_NAME, "Success");
      // The "No FAP regeneration flag" is shown in the analysis item as a badge
      const analysisItem = await historyPage.waitForAnalysisItem(SINGLE_LOG_FILE_NAME);
      await expect(analysisItem).toContainText("No FAP regeneration");
    });

    await test.step("Click on the analysis item to view detailed analysis", async () => {
      await historyPage.clickAnalysisItem(SINGLE_LOG_FILE_NAME);
    });

    await test.step("Verify the detailed analysis page displays all required sections", async () => {
      // Wait for the URL to change to analysis page and content to load
      await analysisPage.waitForAnalysisPage();
      await analysisPage.expectAnalysisSectionsVisible();
    });

    await test.step("Sign out from the application", async () => {
      await dashboardPage.signOut();
      await authPage.waitForLoginForm();
    });
  });
});
