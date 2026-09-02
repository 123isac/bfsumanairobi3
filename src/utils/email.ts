import { supabase } from "@/integrations/supabase/client";

export interface SendEmailOptions {
  type: "test_email" | "order_confirmation" | "delivery_update" | "contact_notification" | "partner_application" | "worker_invite" | "custom";
  to: string | string[];
  subject?: string;
  data?: Record<string, any>;
  html?: string;
}

const RESEND_FALLBACK_KEY = import.meta.env.VITE_RESEND_API_KEY || "";
const DEFAULT_FROM = "BF Suma Nairobi <onboarding@resend.dev>";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://bfsumanairobi3.com";


/**
 * Dispatch an email through:
 * 1. Local / Backend API endpoint: /api/send-email
 * 2. Supabase Edge Function: 'send-email'
 * 3. Direct Resend API call (fallback)
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  const { type, to, data = {} } = options;
  const toList = Array.isArray(to) ? to : [to];

  // 1. Build Subject & HTML
  let subject = options.subject || "Notification from BF Suma Nairobi";
  let html = options.html || "";

  if (!html) {
    switch (type) {
      case "test_email": {
        subject = "🧪 BF Suma Nairobi — Resend Connection Test";
        html = `
          <div style="font-family: sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e1efe6; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #135d3a, #1f8a56); padding: 24px; text-align: center; border-radius: 12px; margin-bottom: 24px;">
              <h1 style="color: #fff; margin: 0; font-size: 22px;">BF SUMA NAIROBI</h1>
              <p style="color: #a9e4c5; margin: 4px 0 0; font-size: 12px; letter-spacing: 1px;">PREMIUM WELLNESS STORE</p>
            </div>
            <h2 style="color: #135d3a; font-size: 18px;">🎉 Resend Email Connection Verified!</h2>
            <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
              This test email confirms that your <strong>Resend API</strong> integration is active and sending emails successfully.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 13px; color: #166534;">
              <strong>Delivered to:</strong> ${toList.join(", ")}<br/>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </div>
            <p style="color: #718096; font-size: 12px;">© ${new Date().getFullYear()} BF Suma Nairobi. All rights reserved.</p>
          </div>
        `;
        break;
      }
      case "order_confirmation": {
        const orderNum = data.orderId ? data.orderId.substring(0, 8).toUpperCase() : "ORDER";
        subject = `🛍️ Order Confirmed (N3/${orderNum}) — BF Suma Nairobi`;
        const itemsList = Array.isArray(data.items) 
          ? data.items.map((i: any) => `<tr><td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;"><strong>${i.name}</strong> x ${i.quantity}</td><td align="right" style="padding: 8px 0; border-bottom: 1px solid #edf2f7; color: #135d3a; font-weight: bold;">KSh ${((i.price || 0) * (i.quantity || 1)).toLocaleString()}</td></tr>`).join("")
          : "";
        html = `
          <div style="font-family: sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e1efe6; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #135d3a, #1f8a56); padding: 24px; text-align: center; border-radius: 12px; margin-bottom: 24px;">
              <h1 style="color: #fff; margin: 0; font-size: 22px;">BF SUMA NAIROBI</h1>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background: #dcfce7; color: #15803d; font-weight: bold; font-size: 11px; padding: 4px 12px; border-radius: 20px;">ORDER CONFIRMED ✓</span>
              <h2 style="color: #1a202c; font-size: 20px; margin: 10px 0 4px;">Thank You, ${data.customerName || "Customer"}!</h2>
              <p style="color: #718096; font-size: 13px; margin: 0;">Order Reference: <strong>#N3/${orderNum}</strong></p>
            </div>
            <table width="100%" style="font-size: 13px; margin: 16px 0; background: #f8fafc; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
              ${itemsList}
              <tr>
                <td style="padding-top: 12px; font-weight: bold; font-size: 15px;">Total Amount</td>
                <td align="right" style="padding-top: 12px; font-weight: bold; font-size: 16px; color: #135d3a;">KSh ${Number(data.totalAmount || 0).toLocaleString()}</td>
              </tr>
            </table>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${SITE_URL}/order-confirmation/${data.orderId}" style="background: #135d3a; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 24px; font-weight: bold; font-size: 13px; display: inline-block;">Track Order Online →</a>
            </div>
          </div>
        `;
        break;
      }
      case "delivery_update": {
        const orderNum = data.orderId ? data.orderId.substring(0, 8).toUpperCase() : "";
        subject = `🚚 Delivery Update: Order #N3/${orderNum} (${data.status?.toUpperCase()})`;
        html = `
          <div style="font-family: sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e1efe6; border-radius: 16px;">
            <h2 style="color: #135d3a;">Delivery Status: ${data.status?.toUpperCase()}</h2>
            <p>Hi ${data.customerName || "Customer"}, your order <strong>#N3/${orderNum}</strong> is now marked as <strong>${data.status}</strong>.</p>
            <p><a href="${SITE_URL}/order-confirmation/${data.orderId}" style="background: #135d3a; color: #fff; padding: 10px 20px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">View Live Order Tracking</a></p>
          </div>
        `;
        break;
      }
      case "contact_notification": {
        subject = `📬 New Contact Inquiry from ${data.name || "Customer"}`;
        html = `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h3 style="color: #135d3a;">New Website Contact Inquiry</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f8fafc; padding: 12px; border-radius: 8px;">${data.message}</p>
          </div>
        `;
        break;
      }
      default: {
        html = `<div style="font-family: sans-serif; padding: 20px;"><h2>BF Suma Nairobi</h2><p>${data.message || "You have a new notification."}</p></div>`;
      }
    }
  }

  const payload = {
    type,
    to: toList,
    subject,
    html,
    data,
  };

  // ── Tier 1: Supabase Database RPC (pg_net directly from PostgreSQL server) ──
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("send_email_resend", {
      to_email: toList[0],
      subject,
      html_body: html,
      from_email: DEFAULT_FROM,
    });

    if (!rpcError && (rpcData as any)?.success) {
      return { success: true, message: "Email dispatched successfully via Supabase!" };
    }
  } catch {
    // Continue to next tier
  }

  // ── Tier 2: Local / Backend API (/api/send-email) ──
  try {
    const apiRes = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (apiRes.ok) {
      const json = await apiRes.json();
      return { success: true, ...json };
    }
  } catch {
    // Continue to next tier
  }

  // ── Tier 3: Supabase Edge Function ('send-email') ──
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke("send-email", {
      body: payload,
    });

    if (!edgeError && edgeData?.success) {
      return { success: true, ...edgeData };
    }
  } catch {
    // Continue
  }

  return {
    success: false,
    error: "Email service requires the send_email_resend SQL function in Supabase. Run the migration in your Supabase SQL Editor to activate.",
  };
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
    data: order,
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
    data: order,
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

  await sendEmail({
    type: "contact_notification",
    to: adminRecipient,
    data: contact,
  });
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

