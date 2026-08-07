import { Injectable, Logger } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private client: BrevoClient | null = null;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey && apiKey !== 'YOUR_BREVO_API_KEY_HERE') {
      this.client = new BrevoClient({ apiKey });
    } else {
      this.logger.warn('BREVO_API_KEY is not configured in environment variables.');
    }
  }

  generateNotificationHtml(title: string, body: string, link?: string): string {
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f0f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0f0f7; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="border-radius: 16px 16px 0 0; overflow: hidden; background: linear-gradient(135deg, #3730a3 0%, #4f46e5 45%, #7c3aed 100%);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 36px 40px 32px; text-align: center;">

                    <!-- Logo mark -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px;">
                      <tr>
                        <td style="background: rgba(255,255,255,0.15); border-radius: 14px; padding: 12px 18px; border: 1px solid rgba(255,255,255,0.25);">
                          <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">&#9776; Loomly</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider line -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="width: 48px; height: 3px; background: rgba(255,255,255,0.4); border-radius: 2px;"></td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CONTENT CARD ── -->
          <tr>
            <td style="background: #ffffff; padding: 0 40px 40px; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">

              <!-- Notification icon badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: -1px auto 0; text-align: center;">
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 50%; width: 56px; height: 56px; text-align: center; vertical-align: middle; border: 4px solid #ffffff; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
                    <span style="font-size: 22px; line-height: 56px; display: block;">&#128276;</span>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h1 style="margin: 24px 0 12px; font-size: 22px; font-weight: 700; color: #111827; text-align: center; letter-spacing: -0.3px; line-height: 1.35;">
                ${title}
              </h1>

              <!-- Subtle divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
                <tr>
                  <td style="width: 40px; height: 3px; background: linear-gradient(90deg, #4f46e5, #7c3aed); border-radius: 2px;"></td>
                </tr>
              </table>

              <!-- Body text -->
              <p style="margin: 0; font-size: 15px; line-height: 1.75; color: #4b5563; text-align: center;">
                ${body}
              </p>

              <!-- Info box -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 36px; background: #f8f7ff; border-radius: 10px; border: 1px solid #e0e7ff;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
                      <strong style="color: #4f46e5;">&#128274; Secure notification</strong> &mdash; This email was sent automatically by the Loomly platform. You are receiving this because you have notifications enabled on your account.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background: #1e1b4b; border-radius: 0 0 16px 16px; padding: 28px 40px; text-align: center;">

              <!-- Brand name -->
              <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #c7d2fe; letter-spacing: 0.5px;">
                LOOMLY
              </p>

              <!-- Tagline -->
              <p style="margin: 0 0 20px; font-size: 12px; color: #6366f1; letter-spacing: 1px; text-transform: uppercase;">
                B2B Fabric Marketplace
              </p>

              <!-- Divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px;">
                <tr>
                  <td style="width: 60px; height: 1px; background: rgba(99,102,241,0.3);"></td>
                </tr>
              </table>

              <!-- Legal -->
              <p style="margin: 0; font-size: 11px; color: #4338ca; line-height: 1.7;">
                &copy; ${year} Loomly B2B Marketplace. All rights reserved.<br>
                You&apos;re receiving this email because you have an active Loomly account.<br>
                To manage notifications, visit your account settings.
              </p>

            </td>
          </tr>

          <!-- Bottom padding -->
          <tr>
            <td style="height: 40px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
  }

  async sendNotificationEmail(
    toEmail: string,
    toName: string,
    title: string,
    body: string,
    link?: string,
  ) {
    if (!this.client) {
      this.logger.log(`[Email Skipped - No Brevo Key] To: ${toEmail} | Subject: ${title}`);
      return;
    }

    try {
      await this.client.transactionalEmails.sendTransacEmail({
        subject: `[Loomly] ${title}`,
        htmlContent: this.generateNotificationHtml(title, body, link),
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'Loomly',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@loomly.com',
        },
        to: [{ email: toEmail, name: toName }],
      });
      this.logger.log(`Notification email sent to ${toEmail}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to ${toEmail}: ${error?.message || error}`,
        error?.response?.body ? JSON.stringify(error.response.body) : error?.stack,
      );
    }
  }
}
