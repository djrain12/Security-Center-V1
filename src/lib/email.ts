export async function sendVerificationEmail(email: string, name: string, verificationUrl: string) {
  const webhook = process.env.EMAIL_WEBHOOK_URL;
  if (!webhook) {
    console.warn(`[email verification] Configure EMAIL_WEBHOOK_URL to deliver verification mail. Link for ${email}: ${verificationUrl}`);
    return { delivered: false, verificationUrl };
  }
  const response = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: email, subject: 'Verify your WSI MIS account', text: `Hello ${name}, verify your account here: ${verificationUrl}`, verificationUrl }) });
  if (!response.ok) throw new Error('Email delivery service rejected the verification message.');
  return { delivered: true };
}
