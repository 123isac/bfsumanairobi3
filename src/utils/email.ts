import { supabase } from "@/integrations/supabase/client";

export interface SendEmailOptions {
  type: "test_email" | "order_confirmation" | "delivery_update" | "contact_notification" | "partner_application" | "worker_invite" | "custom";
  to: string | string[];
  subject?: string;
  data?: Record<string, any>;
  html?: string;
}

/**
 * Dispatch an email through the Supabase Edge Function 'send-email' backed by Resend.
 * Non-blocking, fails gracefully without throwing errors in the user UI.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: options,
    });

    if (error) {
      console.warn("send-email invocation error:", error);
      return { success: false, error: error.message };
    }

    return { 
      success: data?.success ?? true, 
      simulated: data?.simulated ?? false,
      error: data?.error 
    };
  } catch (err: any) {
    console.warn("sendEmail error:", err);
    return { success: false, error: err.message || "Failed to trigger email" };
  }
}

/**
 * Send Order Confirmation Email to Customer
 */
export async function sendOrderConfirmationEmail(order: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  paymentMethod?: string;
  paymentStatus?: string;
}) {
  if (!order.customerEmail) return;

  return sendEmail({
    type: "order_confirmation",
    to: order.customerEmail,
    data: {
      customerName: order.customerName,
      orderId: order.orderId,
      items: order.items,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      paymentMethod: order.paymentMethod || "M-Pesa",
      paymentStatus: order.paymentStatus || "Paid",
    },
  });
}

/**
 * Send Delivery Status Update Email to Customer
 */
export async function sendDeliveryStatusEmail(order: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  trackingNotes?: string;
}) {
  if (!order.customerEmail) return;

  return sendEmail({
    type: "delivery_update",
    to: order.customerEmail,
    data: {
      customerName: order.customerName,
      orderId: order.orderId,
      status: order.status,
      trackingNotes: order.trackingNotes,
    },
  });
}

/**
 * Send Contact Inquiry Notification to Admin + Auto-Reply
 */
export async function sendContactNotificationEmail(contact: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  adminEmail?: string;
}) {
  const adminRecipient = contact.adminEmail || "neonnest254@gmail.com";

  // 1. Alert Admin
  await sendEmail({
    type: "contact_notification",
    to: adminRecipient,
    data: contact,
  });

  // 2. Auto-reply confirmation to customer
  if (contact.email) {
    await sendEmail({
      type: "custom",
      to: contact.email,
      subject: "We received your message — BF Suma Nairobi",
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e1efe6; border-radius: 16px;">
          <h2 style="color: #135d3a; margin-top: 0;">Thank You for Contacting BF Suma Nairobi!</h2>
          <p>Hi ${contact.name},</p>
          <p>We have received your message regarding: <em>"${contact.message.substring(0, 80)}..."</em></p>
          <p>Our wellness consultant team will review your inquiry and get back to you shortly.</p>
          <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #718096;">BF Suma Nairobi • Kenya's Leading Wellness Store</p>
        </div>
      `,
    });
  }
}

/**
 * Send Worker Account Invite
 */
export async function sendWorkerInviteEmail(worker: {
  email: string;
  fullName: string;
  role: string;
  tempPassword?: string;
}) {
  if (!worker.email) return;

  return sendEmail({
    type: "worker_invite",
    to: worker.email,
    data: worker,
  });
}

/**
 * Test Resend Email Connection
 */
export async function sendTestEmail(targetEmail: string) {
  return sendEmail({
    type: "test_email",
    to: targetEmail,
    data: { testTime: new Date().toISOString() },
  });
}
