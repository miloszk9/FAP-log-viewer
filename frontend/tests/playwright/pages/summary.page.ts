import { expect, type Locator, type Page } from "@playwright/test";

import { BasePage } from "./base.page";
import { APP_BASE_URL, PLAYWRIGHT_TIMEOUTS } from "../utils/constants";

export class SummaryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForSummaryPage(): Promise<void> {
    await this.page.waitForURL(`${APP_BASE_URL}/summary`, {
      timeout: PLAYWRIGHT_TIMEOUTS.navigation,
    });
    await this.page.waitForLoadState("networkidle", { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
  }

  private getSection(sectionName: string): Locator {
    // Sections are rendered with titles, we can find them by their text content
    return this.page.getByRole("heading", { name: sectionName, level: 2, exact: true });
  }

  async expectSectionVisible(sectionName: string): Promise<void> {
    const section = this.getSection(sectionName);
    await expect(section).toBeVisible({ timeout: PLAYWRIGHT_TIMEOUTS.ui });
  }

  async expectSummarySectionsVisible(): Promise<void> {
    // Check for the main summary sections as specified in the scenario
    await this.expectSectionVisible("FAP filter");
    await this.expectSectionVisible("Engine");
    await this.expectSectionVisible("Driving");
    await this.expectSectionVisible("Overall averages");
  }
}
