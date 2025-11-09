import { test } from "@playwright/test";

import { AuthPage } from "../pages/auth.page";
import { DashboardPage } from "../pages/dashboard.page";
import { SummaryPage } from "../pages/summary.page";
import { AUTH_TEST_EMAIL, AUTH_TEST_PASSWORD } from "../utils/constants";

test.describe("Check summary analysis", () => {
  test("displays detailed summary analysis with all sections when navigating to summary page", async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);
    const summaryPage = new SummaryPage(page);
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

    await test.step("Navigate to summary page", async () => {
      await dashboardPage.navigateToSummary();
      await summaryPage.waitForSummaryPage();
    });

    await test.step("Verify the summary page displays all required sections", async () => {
      await summaryPage.expectSummarySectionsVisible();
    });

    await test.step("Sign out from the application", async () => {
      await dashboardPage.signOut();
      await authPage.waitForLoginForm();
    });
  });
});
