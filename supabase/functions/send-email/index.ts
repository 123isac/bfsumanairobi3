// Supabase Edge Function: send-email
// Integrates Resend (https://resend.com) for BF Suma Nairobi emails

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailPayload {
  type: "test_email" | "order_confirmation" | "delivery_update" | "contact_notification" | "partner_application" | "worker_invite" | "custom";
  to: string | string[];
  subject?: string;
  data?: Record<string, any>;
  html?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const defaultFrom = Deno.env.get("RESEND_FROM_EMAIL") || "BF Suma Nairobi <onboarding@resend.dev>";
    const siteUrl = Deno.env.get("SITE_URL") || "https://bfsumanairobi3.com";

    const payload: EmailPayload = await req.json();
    const { type, to, data = {} } = payload;

    if (!to) {
      return new Response(
        JSON.stringify({ success: false, error: "Recipient 'to' email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine Subject and HTML template based on email type
    let subject = payload.subject || "Notification from BF Suma Nairobi";
    let html = payload.html || "";

    if (!html) {
      switch (type) {
        case "test_email": {
          subject = "🧪 BF Suma Nairobi — Resend Connection Test";
          html = generateTestEmail(data, siteUrl);
          break;
        }
        case "order_confirmation": {
          const orderNum = data.orderId ? data.orderId.substring(0, 8).toUpperCase() : "ORDER";
          subject = `🛍️ Order Confirmed (N3/${orderNum}) — BF Suma Nairobi`;
          html = generateOrderConfirmationEmail(data, siteUrl);
          break;
        }
        case "delivery_update": {
          const statusText = data.status === "delivered" ? "Delivered 🎉" : "Out for Delivery 🚚";
          subject = `${statusText} — Your BF Suma Order (N3/${data.orderId?.substring(0, 8)?.toUpperCase()})`;
          html = generateDeliveryUpdateEmail(data, siteUrl);
          break;
        }
        case "contact_notification": {
          subject = `📬 New Contact Inquiry from ${data.name || "Customer"}`;
          html = generateContactEmail(data);
          break;
        }
        case "partner_application": {
          subject = `🤝 New Distributor Application from ${data.fullName || "Candidate"}`;
          html = generatePartnerEmail(data);
          break;
        }
        case "worker_invite": {
          subject = `🔑 Welcome to BF Suma Nairobi Staff Portal`;
          html = generateWorkerInviteEmail(data, siteUrl);
          break;
        }
        default: {
          html = `<div style="font-family: sans-serif; padding: 20px;"><h2>BF Suma Nairobi</h2><p>${data.message || "You have a new notification."}</p></div>`;
        }
      }
    }

    // If RESEND_API_KEY is not configured yet, log and return graceful simulated success
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY secret is not set in Supabase. Email simulated successfully:", {
        to,
        subject,
        type,
      });

      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          message: "RESEND_API_KEY is not set in Supabase Secrets. Email logged in console.",
          details: { to, subject, type },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Resend API (https://api.resend.com/emails)
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: defaultFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ success: false, error: resendData.message || "Failed to send email via Resend" }),
        { status: resendResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, resendId: resendData.id, message: "Email sent successfully!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-email Edge Function error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ==========================================
// TEMPLATE 1: TEST EMAIL
// ==========================================
function generateTestEmail(data: Record<string, any>, siteUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Resend Test</title></head>
<body style="margin: 0; padding: 0; background-color: #f4fbf7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #e1efe6;">
          <tr>
            <td style="background: linear-gradient(135deg, #135d3a 0%, #1f8a56 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">BF SUMA NAIROBI</h1>
              <p style="margin: 4px 0 0; color: #a9e4c5; font-size: 12px; letter-spacing: 2px;">PREMIUM WELLNESS STORE</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #135d3a; font-size: 20px;">🎉 Resend Email Connection Verified!</h2>
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                This test email confirms that your <strong>Resend API</strong> integration is working correctly with BF Suma Nairobi.
              </p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #166534;"><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 0; font-size: 14px; color: #166534;"><strong>Status:</strong> Active & Connected</p>
              </div>
              <p style="margin: 0; color: #718096; font-size: 13px;">
                Transactional emails (Order Confirmations, Tracking Updates, and Staff Alerts) will now dispatch automatically.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">© ${new Date().getFullYear()} BF Suma Nairobi. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ==========================================
// TEMPLATE 2: ORDER CONFIRMATION
// ==========================================
function generateOrderConfirmationEmail(data: Record<string, any>, siteUrl: string) {
  const {
    customerName = "Valued Customer",
    orderId = "",
    items = [],
    totalAmount = 0,
    shippingAddress = "",
    shippingCity = "Nairobi",
    paymentMethod = "M-Pesa",
    paymentStatus = "Paid",
  } = data;

  const orderNum = orderId.substring(0, 8).toUpperCase();
  const trackingUrl = `${siteUrl}/order-confirmation/${orderId}`;

  const itemsRows = Array.isArray(items)
    ? items
        .map(
          (item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #edf2f7; color: #2d3748; font-size: 14px;">
          <strong>${item.name || "BF Suma Product"}</strong>
          <br/><span style="font-size: 12px; color: #718096;">Qty: ${item.quantity || 1}</span>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #edf2f7; color: #135d3a; font-weight: 600; font-size: 14px;">
          KSh ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
        </td>
      </tr>
    `
        )
        .join("")
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Order Confirmation</title></head>
<body style="margin: 0; padding: 0; background-color: #f4fbf7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #e1efe6;">
          <tr>
            <td style="background: linear-gradient(135deg, #135d3a 0%, #1f8a56 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">BF SUMA NAIROBI</h1>
              <p style="margin: 4px 0 0; color: #a9e4c5; font-size: 12px; letter-spacing: 2px;">AUTHENTIC WELLNESS STORE</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-weight: 700; font-size: 12px; padding: 6px 14px; rounded-full; border-radius: 20px;">
                  ORDER CONFIRMED ✓
                </span>
                <h2 style="margin: 12px 0 4px; color: #1a202c; font-size: 22px;">Thank You, ${customerName}!</h2>
                <p style="margin: 0; color: #718096; font-size: 14px;">We have received your order <strong>#N3/${orderNum}</strong></p>
              </div>

              <!-- Order Summary Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  ${itemsRows}
                  <tr>
                    <td style="padding-top: 14px; font-size: 16px; font-weight: 700; color: #1a202c;">Total Amount</td>
                    <td align="right" style="padding-top: 14px; font-size: 18px; font-weight: 800; color: #135d3a;">KSh ${Number(totalAmount).toLocaleString()}</td>
                  </tr>
                </table>
              </div>

              <!-- Delivery & Payment Info -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 10px;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #718096; text-transform: uppercase;">Delivery Address</p>
                    <p style="margin: 0; font-size: 14px; color: #2d3748; line-height: 1.4;">${shippingAddress || "Provided during checkout"}<br/><strong>${shippingCity}</strong></p>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 10px;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #718096; text-transform: uppercase;">Payment Status</p>
                    <p style="margin: 0; font-size: 14px; color: #2d3748; line-height: 1.4;">Method: ${paymentMethod}<br/><span style="color: #166534; font-weight: 600;">Status: ${paymentStatus}</span></p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${trackingUrl}" style="display: inline-block; background-color: #135d3a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(19, 93, 58, 0.25);">
                  Track My Order Online →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="margin: 0 0 4px; color: #718096; font-size: 13px;">Need assistance? WhatsApp us at <strong>+254 700 000 000</strong></p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">© ${new Date().getFullYear()} BF Suma Nairobi. 100% Genuine Certified Health Products.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ==========================================
// TEMPLATE 3: DELIVERY STATUS UPDATE
// ==========================================
function generateDeliveryUpdateEmail(data: Record<string, any>, siteUrl: string) {
  const { customerName = "Customer", orderId = "", status = "shipped", trackingNotes = "" } = data;
  const orderNum = orderId.substring(0, 8).toUpperCase();
  const isDelivered = status === "delivered";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Delivery Update</title></head>
<body style="margin: 0; padding: 0; background-color: #f4fbf7; font-family: sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e1efe6;">
          <tr>
            <td style="background: linear-gradient(135deg, #135d3a 0%, #1f8a56 100%); padding: 28px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px;">BF SUMA NAIROBI</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 30px;">
              <h2 style="color: #135d3a; margin: 0 0 12px;">
                ${isDelivered ? "🎉 Order Delivered Successfully!" : "🚚 Your Order is On The Way!"}
              </h2>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.5; margin: 0 0 20px;">
                Hi ${customerName}, your BF Suma order <strong>#N3/${orderNum}</strong> has been updated to: <strong style="color: #135d3a; text-transform: uppercase;">${status}</strong>.
              </p>
              ${trackingNotes ? `<p style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; color: #64748b;"><strong>Note:</strong> ${trackingNotes}</p>` : ""}
              <div style="margin-top: 24px; text-align: center;">
                <a href="${siteUrl}/order-confirmation/${orderId}" style="background-color: #135d3a; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 24px; font-size: 14px; font-weight: bold;">
                  View Live Order Status
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ==========================================
// TEMPLATE 4: CONTACT FORM
// ==========================================
function generateContactEmail(data: Record<string, any>) {
  return `
<div style="font-family: sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
  <h2 style="color: #135d3a; margin-top: 0;">📬 New Website Inquiry</h2>
  <p><strong>Name:</strong> ${data.name}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
  <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 16px;">
    <strong>Message:</strong>
    <p style="margin: 8px 0 0; color: #334155; white-space: pre-wrap;">${data.message}</p>
  </div>
</div>
  `;
}

// ==========================================
// TEMPLATE 5: PARTNER APPLICATION
// ==========================================
function generatePartnerEmail(data: Record<string, any>) {
  return `
<div style="font-family: sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
  <h2 style="color: #135d3a; margin-top: 0;">🤝 New BF Suma Distributor Application</h2>
  <p><strong>Full Name:</strong> ${data.fullName}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Phone:</strong> ${data.phone}</p>
  <p><strong>City / Town:</strong> ${data.city}</p>
  <p><strong>Experience:</strong> ${data.experience || "N/A"}</p>
  <p><strong>Motivation:</strong> ${data.motivation || "N/A"}</p>
</div>
  `;
}

// ==========================================
// TEMPLATE 6: WORKER INVITE
// ==========================================
function generateWorkerInviteEmail(data: Record<string, any>, siteUrl: string) {
  return `
<div style="font-family: sans-serif; padding: 28px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 16px;">
  <h2 style="color: #135d3a; margin-top: 0;">Welcome to BF Suma Nairobi Staff Portal</h2>
  <p>Hi ${data.fullName},</p>
  <p>Your staff account has been created with the role: <strong>${data.role}</strong>.</p>
  <div style="background: #f0fdf4; padding: 16px; border-radius: 12px; margin: 20px 0;">
    <p style="margin: 0 0 6px;"><strong>Login Email:</strong> ${data.email}</p>
    <p style="margin: 0;"><strong>Temporary Password:</strong> ${data.tempPassword || "As assigned by admin"}</p>
  </div>
  <p><a href="${siteUrl}/admin/login" style="background: #135d3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: bold; display: inline-block;">Log in to Staff Portal</a></p>
</div>
  `;
}
