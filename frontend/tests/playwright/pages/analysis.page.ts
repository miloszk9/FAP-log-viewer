import { expect, type Locator, type Page } from "@playwright/test";

import { BasePage } from "./base.page";
import { APP_BASE_URL, PLAYWRIGHT_TIMEOUTS } from "../utils/constants";

export class AnalysisPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForAnalysisPage(): Promise<string> {
    await this.page.waitForURL(new RegExp(`${APP_BASE_URL}/analyses/[^/]+$`), {
      timeout: PLAYWRIGHT_TIMEOUTS.navigation,
    });
    await this.page.waitForLoadState("networkidle", { timeout: PLAYWRIGHT_TIMEOUTS.navigation });

    // Extract the analysis ID from the URL
    const url = this.page.url();
    const match = url.match(/\/analyses\/([^/]+)$/);
    if (!match) {
      throw new Error(`Could not extract analysis ID from URL: ${url}`);
    }
    return match[1];
  }

  private getSection(sectionName: string): Locator {
    // Sections are rendered with titles, we can find them by their text content
    return this.page.getByRole("heading", { name: sectionName, level: 2, exact: true });
  }

  async expectSectionVisible(sectionName: string): Promise<void> {
    const section = this.getSection(sectionName);
    await expect(section).toBeVisible({ timeout: PLAYWRIGHT_TIMEOUTS.ui });
  }

  async expectAnalysisSectionsVisible(): Promise<void> {
    // Check for the main analysis sections as specified in the scenario
    await this.expectSectionVisible("FAP filter");
    await this.expectSectionVisible("Engine");
    await this.expectSectionVisible("Driving");
    await this.expectSectionVisible("Overall metrics");
  }
}
