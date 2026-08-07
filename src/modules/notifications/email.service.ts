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
    const actionButton = link
      ? `<a href="${link}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px;">View Details</a>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
            .content { padding: 30px; color: #374151; line-height: 1.6; }
            .title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 10px; }
            .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div className="container">
            <div className="header">
              <h1>Loomly Notification</h1>
            </div>
            <div className="content">
              <div className="title">${title}</div>
              <p>${body}</p>
              ${actionButton}
            </div>
            <div className="footer">
              &copy; ${new Date().getFullYear()} Loomly B2B Marketplace. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;
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
