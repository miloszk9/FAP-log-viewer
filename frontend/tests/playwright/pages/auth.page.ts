import { expect, type Page } from "@playwright/test";

import { BasePage } from "./base.page";
import { PLAYWRIGHT_TIMEOUTS } from "../utils/constants";

type RegistrationResult = "success" | "error";

export class AuthPage extends BasePage {
  private readonly emailInput = this.getByTestId("auth-email-input");
  private readonly passwordInput = this.getByTestId("auth-password-input");
  private readonly submitButton = this.getByTestId("auth-submit-button");
  private readonly createAccountLink = this.getByTestId("create-account-link");
  private readonly generalError = this.getByTestId("auth-error");
  private readonly signInLink = this.page.getByTestId("sign-in-link");

  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(): Promise<void> {
    await this.goto("/");
    await this.waitForLoginForm();
  }

  async navigateToRegister(): Promise<void> {
    await this.waitForLoginForm();
    await this.createAccountLink.click();
    await this.expectUrlMatches(/\/register$/);
    await this.waitForRegisterForm();
  }

  async waitForLoginForm(): Promise<void> {
    await this.waitForVisible(this.emailInput);
    await expect(this.submitButton).toContainText(/sign in/i);
  }

  async waitForRegisterForm(): Promise<void> {
    await this.waitForVisible(this.emailInput);
    await expect(this.submitButton).toContainText(/create account/i);
    const preparingStatus = this.page.getByRole("status", { name: "Preparing registration…" });
    await preparingStatus.waitFor({ state: "detached", timeout: PLAYWRIGHT_TIMEOUTS.ui }).catch(() => undefined);
  }

  async clickSignInLink(): Promise<void> {
    await this.signInLink.click();
    await this.expectUrlMatches(/\/$/);
    await this.waitForLoginForm();
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.setFieldValue(this.emailInput, email);
    await this.setFieldValue(this.passwordInput, password);
  }

  private async setFieldValue(field: ReturnType<BasePage["getByTestId"]>, value: string): Promise<void> {
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await field.fill(value);
      await expect(field).toHaveValue(value);
      await this.page.waitForTimeout(200);

      const currentValue = await field.inputValue();
      if (currentValue === value) {
        return;
      }
    }

    throw new Error(`Unable to set field value after ${maxAttempts} attempts`);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.waitForLoginForm();
    await this.fillCredentials(email, password);
    await this.submit();
    await this.page.waitForURL(/\/history$/, { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
  }

  async register(email: string, password: string): Promise<RegistrationResult> {
    await this.waitForRegisterForm();
    await this.fillCredentials(email, password);
    await this.submit();

    const registrationOutcome = await Promise.race([
      this.page
        .waitForURL(/\/\?registered=1$/, { timeout: PLAYWRIGHT_TIMEOUTS.navigation })
        .then(() => "success" as const),
      this.generalError
        .waitFor({ state: "visible", timeout: PLAYWRIGHT_TIMEOUTS.navigation })
        .then(() => "error" as const),
    ]).catch((error) => {
      throw error;
    });

    if (registrationOutcome === "success") {
      await this.waitForLoginForm();
      return "success";
    }

    return "error";
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.generalError.isVisible()) {
      return this.generalError.innerText();
    }

    return null;
  }
}
