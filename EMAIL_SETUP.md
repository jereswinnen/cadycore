# Email Integration Setup Guide

This guide explains how to set up the email functionality for automatic photo delivery after payment completion.

## Overview

The email integration automatically sends purchased photos as ZIP attachments to customers after successful payment. It includes:

- Automatic email delivery via Stripe webhook
- Manual email sending from the success page
- Professional email templates with branding
- Retry logic for failed deliveries
- Email status tracking in the database

## Prerequisites

1. **Database Migration**: Run the SQL migration to add email tracking columns
2. **Resend Account**: Sign up for a Resend account for email delivery
3. **Domain Configuration**: Set up your sending domain (recommended for production)

## Setup Steps

### 1. Database Migration

Run the SQL migration in your Supabase dashboard:

```sql
-- File: migrations/add_email_tracking.sql
-- This adds email tracking columns to the payments table
```

Navigate to Supabase Dashboard → SQL Editor and run the contents of `migrations/add_email_tracking.sql`.

### 2. Resend Configuration

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Get your API key**: Go to API Keys section and create a new API key
3. **Set up your domain** (recommended for production):
   - Add your domain in the Domains section
   - Verify DNS records for better deliverability
   - Use a subdomain like `mail.yourdomain.com` for sending

### 3. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Email Configuration (Required)
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com

# Application URL (Required for webhook email calls)
NEXTAUTH_URL=http://localhost:3000  # Use your production URL in production
```

### 4. Email Address Setup

**For Development:**
- You can use `onboarding@resend.dev` as the FROM_EMAIL for testing
- Emails will only be delivered to verified email addresses in your Resend account

**For Production:**
- Set up a custom domain in Resend
- Use addresses like `noreply@yourdomain.com` for FROM_EMAIL
- Set a support email for REPLY_TO_EMAIL

## How It Works

### Automatic Email Flow

1. Customer completes payment via Stripe
2. Stripe webhook triggers payment completion
3. Photos are unlocked in the database
4. Email API is automatically called with payment ID
5. System creates ZIP file with high-resolution photos
6. Email is sent with ZIP attachment via Resend
7. Database is updated with email delivery status

### Manual Email Sending

Users can also manually request email delivery from the success page:
- "Email Photos" button on the success page
- Calls the same email API with force_resend=true
- Shows delivery status and confirmation

### Email Template Features

- Professional responsive design
- Purchase details and bib number
- ZIP attachment with all purchased photos
- Clear instructions for downloading and extracting
- Branded footer with support information

## File Structure

```
src/
├── lib/
│   └── email.ts                    # Email utility functions and Resend config
├── components/
│   └── EmailTemplate.tsx          # Email template component and HTML generator
├── app/api/
│   ├── email/photos/route.ts       # Email sending API endpoint
│   └── stripe-webhook/route.ts     # Modified to trigger emails
└── app/success/[bib]/page.tsx      # Updated with email status and manual send
```

## Configuration Options

The email system includes several configuration options in `src/lib/email.ts`:

```typescript
export const EMAIL_CONFIG = {
  fromEmail: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
  replyToEmail: process.env.REPLY_TO_EMAIL || 'support@yourdomain.com',
  maxAttachmentSize: 25 * 1024 * 1024, // 25MB limit for Resend
  maxRetries: 3,
  retryDelayMs: 2000,
} as const;
```

## Error Handling

The system includes comprehensive error handling:

- **Retry Logic**: Up to 3 attempts with exponential backoff
- **Database Tracking**: Email attempts and status are recorded
- **User Feedback**: Clear error messages and status indicators
- **Fallback Options**: Manual email sending if automatic delivery fails

## Testing

### Development Testing

1. **Use Resend's Development Mode**: Emails only go to verified addresses
2. **Test with Small Photos**: Ensure ZIP files are within size limits
3. **Check Database Updates**: Verify email status is properly recorded

### Email Content Testing

1. **Preview Template**: The email template generates clean HTML
2. **Mobile Compatibility**: Template is responsive for mobile devices
3. **Attachment Handling**: ZIP files should download and extract properly

## Troubleshooting

### Common Issues

1. **Email Not Sending**:
   - Check RESEND_API_KEY is correctly set
   - Verify FROM_EMAIL domain is configured in Resend
   - Check Resend dashboard for delivery logs

2. **ZIP File Too Large**:
   - Resend has a 25MB attachment limit
   - Consider implementing alternative download links for large orders

3. **Webhook Timeouts**:
   - Email sending is non-blocking in webhook
   - Failed emails can be retried manually from success page

4. **Database Errors**:
   - Ensure migration was run successfully
   - Check payment records exist before sending emails

### Monitoring

- Check Resend dashboard for delivery statistics
- Monitor database for email_attempts and failed sends
- Review server logs for email-related errors

## Production Considerations

1. **Domain Reputation**: Use a dedicated sending domain
2. **Rate Limits**: Resend has generous limits, but monitor usage
3. **Monitoring**: Set up alerts for failed email deliveries
4. **Backup Strategy**: Ensure manual email sending always works
5. **GDPR Compliance**: Consider data retention for email tracking

## Support

If you encounter issues:
1. Check the Resend dashboard for delivery logs
2. Review server logs for detailed error messages
3. Test with the manual "Email Photos" button
4. Verify all environment variables are set correctly