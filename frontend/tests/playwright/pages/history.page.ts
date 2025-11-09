import { expect, type Locator, type Page } from "@playwright/test";

import { BasePage } from "./base.page";
import { APP_BASE_URL, PLAYWRIGHT_TIMEOUTS } from "../utils/constants";

export class HistoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForHistoryPage(): Promise<void> {
    await this.page.waitForURL(`${APP_BASE_URL}/history`, { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
    await this.page.waitForLoadState("networkidle", { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
  }

  private getAnalysisItem(fileName: string): Locator {
    return this.getByTestId(`analysis-item-${fileName}`);
  }

  private getAnalysisStatus(fileName: string): Locator {
    return this.getAnalysisItem(fileName).getByTestId("analysis-status");
  }

  async waitForAnalysisItem(fileName: string): Promise<Locator> {
    const item = this.getAnalysisItem(fileName);
    await expect(item).toBeVisible({ timeout: PLAYWRIGHT_TIMEOUTS.navigation });
    return item;
  }

  async expectAnalysisStatus(fileName: string, status: string | RegExp): Promise<void> {
    const badge = this.getAnalysisStatus(fileName);
    await expect(badge).toHaveText(status, { timeout: PLAYWRIGHT_TIMEOUTS.ui });
  }
}
