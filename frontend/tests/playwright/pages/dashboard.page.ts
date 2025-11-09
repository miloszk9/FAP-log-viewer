import { type Page } from "@playwright/test";

import { BasePage } from "./base.page";
import { APP_BASE_URL, PLAYWRIGHT_TIMEOUTS } from "../utils/constants";

export class DashboardPage extends BasePage {
  private readonly historyLink = this.getByTestId("sidebar-history-link");
  private readonly summaryLink = this.getByTestId("sidebar-summary-link");
  private readonly uploadLink = this.getByTestId("sidebar-upload-link");
  private readonly signOutButton = this.getByTestId("sidebar-signout-button");

  constructor(page: Page) {
    super(page);
  }

  async waitForDashboard(): Promise<void> {
    await this.waitForVisible(this.historyLink);
    await this.waitForVisible(this.summaryLink);
    await this.waitForVisible(this.uploadLink);
    await this.waitForVisible(this.signOutButton);
  }

  async navigateToHistory(): Promise<void> {
    await this.waitForVisible(this.historyLink);
    await this.historyLink.click();
    await this.page.waitForURL(`${APP_BASE_URL}/history`, { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
  }

  async navigateToSummary(): Promise<void> {
    await this.waitForVisible(this.summaryLink);
    await this.summaryLink.click();
    await this.page.waitForURL(`${APP_BASE_URL}/summary`, { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
  }

  async navigateToUpload(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.waitForVisible(this.uploadLink);
    await this.uploadLink.click();
    await this.page.waitForURL(`${APP_BASE_URL}/upload`, { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
  }

  async signOut(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.waitForVisible(this.signOutButton);
    await this.signOutButton.click();
    await this.page.waitForURL(`${APP_BASE_URL}/?redirect=%2Fhistory`, {
      timeout: PLAYWRIGHT_TIMEOUTS.navigation,
    });
  }
}
