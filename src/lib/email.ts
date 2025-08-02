import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export function getEmailConfig() {
  return {
    fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    replyToEmail: process.env.REPLY_TO_EMAIL || 'support@yourdomain.com',
    maxAttachmentSize: 25 * 1024 * 1024, // 25MB limit for Resend
    maxRetries: 3,
    retryDelayMs: 2000,
  };
}

export const EMAIL_CONFIG = getEmailConfig();

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  type?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resendClient = getResendClient();
    const config = getEmailConfig();
    const { data, error } = await resendClient.emails.send({
      from: config.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || config.replyToEmail,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        content_type: att.type || 'application/octet-stream',
      })),
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
}

export async function sendEmailWithRetry(
  options: SendEmailOptions, 
  maxRetries?: number
): Promise<{ success: boolean; messageId?: string; error?: string; attempts: number }> {
  const config = getEmailConfig();
  const retries = maxRetries || config.maxRetries;
  let lastError: string = '';
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    const result = await sendEmail(options);
    
    if (result.success) {
      return { ...result, attempts: attempt };
    }
    
    lastError = result.error || 'Unknown error';
    
    // Don't wait after the last attempt
    if (attempt < retries) {
      await new Promise(resolve => 
        setTimeout(resolve, config.retryDelayMs * attempt)
      );
    }
  }
  
  return { 
    success: false, 
    error: lastError, 
    attempts: retries 
  };
}