import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order, type } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "orders@masanimarine.com";

    // Build the email HTML based on payment method
    const isPaypal = order.payment_method === "paypal";
    const isPaid = order.payment_status === "paid";

    const subject = isPaid
      ? `✅ Order Confirmed #${order.id} — Masani Marine`
      : `📋 Order Received #${order.id} — Bank Transfer Instructions`;

    const itemRows = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">$${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const bankInstructions = !isPaid
      ? `
      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="font-weight:bold;margin:0 0 12px;color:#92400e;">📌 Wire Transfer Instructions</p>
        <p style="margin:0 0 8px;color:#78350f;">Please transfer <strong>$${order.total?.toLocaleString()}</strong> to:</p>
        <table style="width:100%;font-size:14px;">
          <tr><td style="color:#6b7280;padding:4px 0;">Bank:</td><td><strong>HDFC BANK</strong></td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">Account Name:</td><td><strong>MASANI MARINE</strong></td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">Account No:</td><td><strong>50200030539450</strong></td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">IFSC Code:</td><td><strong>HDFC0001687</strong></td></tr>
          <tr><td style="color:#6b7280;padding:4px 0;">Reference:</td><td><strong>Order #${order.id}</strong></td></tr>
        </table>
        <p style="margin:12px 0 0;font-size:13px;color:#92400e;">⚠️ Please include Order #${order.id} as the payment reference.</p>
      </div>`
      : "";

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:#0c2340;padding:32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;letter-spacing:2px;">MASANI MARINE</h1>
          <p style="color:#67a7d3;margin:8px 0 0;font-size:13px;letter-spacing:1px;">MARINE EQUIPMENT SPECIALISTS</p>
        </div>

        <!-- Status Banner -->
        <div style="background:${isPaid ? "#059669" : "#d97706"};padding:16px;text-align:center;">
          <p style="color:white;margin:0;font-weight:bold;font-size:16px;">
            ${isPaid ? "✅ Payment Confirmed" : "📋 Order Received — Awaiting Payment"}
          </p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <p style="color:#374151;margin:0 0 8px;">Dear <strong>${order.shipping_address?.name || "Customer"}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 24px;line-height:1.6;">
            ${
              isPaid
                ? "Thank you for your payment! Your order has been confirmed and is being processed."
                : "Thank you for your order. Please complete the bank transfer to proceed."
            }
          </p>

          <!-- Order ID -->
          <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
            <p style="color:#6b7280;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
            <p style="color:#0c2340;font-size:20px;font-weight:bold;margin:0;font-family:monospace;">#${order.id}</p>
            <p style="color:#6b7280;font-size:12px;margin:8px 0 0;">Payment: ${isPaypal ? "PayPal" : "Bank Transfer"}</p>
          </div>

          <!-- Items -->
          <h3 style="color:#0c2340;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Order Items</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:8px;text-align:left;color:#6b7280;font-weight:600;">Product</th>
                <th style="padding:8px;text-align:center;color:#6b7280;font-weight:600;">Qty</th>
                <th style="padding:8px;text-align:right;color:#6b7280;font-weight:600;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- Totals -->
          <div style="border-top:2px solid #e5e7eb;padding-top:12px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="color:#6b7280;font-size:14px;">Subtotal</span>
              <span style="font-size:14px;">$${order.subtotal?.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#6b7280;font-size:14px;">Shipping</span>
              <span style="font-size:14px;">${order.shipping_total === 0 ? "Free" : "$" + order.shipping_total?.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-weight:bold;font-size:16px;color:#0c2340;">Total</span>
              <span style="font-weight:bold;font-size:18px;color:#0c2340;">$${order.total?.toLocaleString()}</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <h3 style="color:#0c2340;margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Ship To</h3>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;font-size:14px;color:#374151;line-height:1.8;">
            ${order.shipping_address?.name}<br/>
            ${order.shipping_address?.line1} ${order.shipping_address?.line2 || ""}<br/>
            ${order.shipping_address?.city}, ${order.shipping_address?.state} ${order.shipping_address?.zip}<br/>
            ${order.shipping_address?.country}
          </div>

          ${bankInstructions}

          <p style="color:#6b7280;font-size:13px;line-height:1.6;">
            Questions? Contact us at <a href="mailto:sales@masanienterprise.com" style="color:#0c2340;">sales@masanienterprise.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f3f4f6;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© 2025 Masani Marine. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Masani Marine <${FROM_EMAIL}>`,
        to: [order.user_email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-order-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
