import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, of, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly email_endpoint: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const emailConfig = this.configService.get('email');
    this.email_endpoint = `http://${emailConfig.url}:${emailConfig.port}/${emailConfig.endpoint}`;
  }

  async refresh(): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(this.email_endpoint).pipe(
          timeout(5000),
          catchError((error) => {
            if (error?.response?.status === 429) {
              return of(error.response);
            }
            // Log warning for other errors
            this.logger.warn(
              `Email refresh failed with status: ${error?.response?.status || 'unknown'} - ${error?.message}`,
            );
            return of(error.response);
          }),
        ),
      );
      if (response && response.status >= 200 && response.status < 300) {
        this.logger.log(
          `Email refresh succeeded with status: ${response.status}`,
        );
      } else if (response && response.status === 429) {
        // Do not log anything for 429
      } else if (response) {
        this.logger.warn(`Email refresh returned status: ${response.status}`);
      }
    } catch (e) {
      // Should never throw due to catchError, but just in case
      this.logger.warn(
        `Email refresh encountered an unexpected error: ${e?.message}`,
      );
    }
  }
}
