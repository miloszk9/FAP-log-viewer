import { test } from "@playwright/test";

import { AuthPage } from "../pages/auth.page";
import { DashboardPage } from "../pages/dashboard.page";
import { AUTH_TEST_EMAIL, AUTH_TEST_PASSWORD } from "../utils/constants";

test.describe("Auth - register, login, logout", () => {
  test("allows a user to register, login, and sign out", async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);
    const email = AUTH_TEST_EMAIL;
    const password = AUTH_TEST_PASSWORD;

    await test.step("Navigate to login page", async () => {
      await authPage.navigateToLogin();
    });

    await test.step("Register a new account", async () => {
      await authPage.navigateToRegister();
      const registrationResult = await authPage.register(email, password);

      if (registrationResult === "error") {
        await authPage.clickSignInLink();
      }
    });

    await test.step("Login with the registered credentials", async () => {
      await authPage.login(email, password);
      await dashboardPage.waitForDashboard();
    });

    await test.step("Sign out and verify redirect to login page", async () => {
      await dashboardPage.signOut();
      await authPage.waitForLoginForm();
    });
  });
});
