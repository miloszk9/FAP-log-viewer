import { expect, type Page } from "@playwright/test";

import { BasePage } from "./base.page";
import { APP_BASE_URL, PLAYWRIGHT_TIMEOUTS } from "../utils/constants";

export class UploadPage extends BasePage {
  private readonly dropzone = this.getByTestId("file-dropzone");
  private readonly uploadButton = this.getByTestId("upload-button");
  private readonly successMessage = this.getByTestId("upload-success");

  constructor(page: Page) {
    super(page);
  }

  async gotoUpload(): Promise<void> {
    await this.goto("/upload");
    await this.expectUrlMatches(new RegExp(`${APP_BASE_URL}/upload`));
    await this.waitForUploadForm();
  }

  async waitForUploadForm(): Promise<void> {
    await this.waitForVisible(this.dropzone);
    await this.waitForVisible(this.uploadButton);
    // Note: Upload button is disabled until a file is selected
  }

  async selectFile(filePath: string): Promise<void> {
    await this.waitForUploadForm();
    const fileInput = this.dropzone.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    // Wait for upload button to be enabled after file selection
    await expect(this.uploadButton).toBeEnabled({ timeout: PLAYWRIGHT_TIMEOUTS.ui });
  }

  async submitUpload(): Promise<void> {
    await expect(this.uploadButton).toBeEnabled();
    await this.uploadButton.click();
  }

  async waitForSuccessAndRedirect(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: PLAYWRIGHT_TIMEOUTS.ui });
    await this.page.waitForURL(`${APP_BASE_URL}/history`, { timeout: PLAYWRIGHT_TIMEOUTS.navigation });
  }
}
