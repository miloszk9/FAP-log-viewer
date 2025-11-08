import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { PLAYWRIGHT_TIMEOUTS } from "../utils/constants";

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  protected async expectUrlMatches(matcher: RegExp | string): Promise<void> {
    await expect(this.page).toHaveURL(matcher, { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
  }

  protected async waitForVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible({ timeout: PLAYWRIGHT_TIMEOUTS.ui });
  }
}
