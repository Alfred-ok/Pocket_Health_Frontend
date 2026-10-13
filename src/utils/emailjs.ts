import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

export const isEmailJsConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export interface EmergencyEmailRecipient {
  name: string;
  email: string;
}

export interface EmergencyEmailParams {
  subject: string;
  message: string;
  fromName: string;
}

export interface EmergencyEmailResult {
  sent: EmergencyEmailRecipient[];
  failed: EmergencyEmailRecipient[];
}

/**
 * Sends the SOS message to each recipient through EmailJS (one email per contact, so
 * one bad address doesn't block the rest). The EmailJS template must set its
 * "To Email" field to {{to_email}} and use {{subject}} / {{message}} in the content.
 */
export async function sendEmergencyEmails(
  recipients: EmergencyEmailRecipient[],
  { subject, message, fromName }: EmergencyEmailParams
): Promise<EmergencyEmailResult> {
  if (!isEmailJsConfigured) {
    throw new Error("EmailJS is not configured");
  }

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      emailjs.send(
        SERVICE_ID!,
        TEMPLATE_ID!,
        {
          to_email: recipient.email,
          to_name: recipient.name,
          from_name: fromName,
          subject,
          message,
        },
        { publicKey: PUBLIC_KEY! }
      )
    )
  );

  return {
    sent: recipients.filter((_, i) => results[i].status === "fulfilled"),
    failed: recipients.filter((_, i) => results[i].status === "rejected"),
  };
}
