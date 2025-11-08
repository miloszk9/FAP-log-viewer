import type { Page } from "@playwright/test";

import { PLAYWRIGHT_TIMEOUTS } from "./constants";

export interface TestUserCredentials {
  email: string;
  password: string;
}

export const waitForUrl = async (page: Page, matcher: RegExp | string, timeout = PLAYWRIGHT_TIMEOUTS.navigation) => {
  await page.waitForURL(matcher, { timeout });
};
