
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

type InquiryRecord = {
  id: number;
  property_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country_of_residence: string | null;
  preferred_visit_date: string | null;
  message: string | null;
  notification_processing_token: string | null;
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validSecret(provided: string | null, expected: string): boolean {
  if (!provided || !expected) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.PROPERTY_INQUIRY_WEBHOOK_SECRET;

  if (!secret || !validSecret(request.headers.get("x-webhook-secret"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!supabaseUrl || !supabaseKey || !resendKey || !adminEmail) {
    console.error("Missing property inquiry notification configuration.");
    return NextResponse.json(
      { error: "Server configuration incomplete" },
      { status: 500 }
    );
  }

  let inquiryId: number;
  let processingToken: string | null = null;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const body = await request.json();

    if (
      body?.type !== "INSERT" ||
      body?.schema !== "public" ||
      body?.table !== "property_inquiries" ||
      !Number.isSafeInteger(body?.record?.id) ||
      body.record.id <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid webhook event" },
        { status: 400 }
      );
    }

    // Only use the inquiry ID from the webhook.
    // Retrieve the real inquiry from the database.
    inquiryId = body.record.id;

    const { data: claimed, error: claimError } = await supabase.rpc(
      "claim_property_inquiry_notification",
      { target_inquiry_id: inquiryId }
    );

    if (claimError) {
      console.error("Notification claim failed:", claimError);
      return NextResponse.json(
        { error: "Unable to claim inquiry" },
        { status: 500 }
      );
    }

    if (!claimed || claimed.length === 0) {
      // Already sent, currently processing, or inquiry not found.
      return NextResponse.json({
        success: true,
        skipped: true,
      });
    }

    const inquiry = claimed[0] as InquiryRecord;
    processingToken = inquiry.notification_processing_token;

    if (!processingToken) {
      throw new Error("Claim returned no processing token.");
    }

    const resend = new Resend(resendKey);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const adminUrl = `${siteUrl.replace(/\/$/, "")}/admin`;

    const { data, error: sendError } = await resend.emails.send(
      {
        from: "FasoHome <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `New FasoHome Property Inquiry #${inquiry.id}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
            <h1 style="color:#166534">New Property Inquiry</h1>
            <p>A buyer submitted an inquiry through FasoHome.</p>

            <h2>Buyer Information</h2>
            <p>
              <strong>Name:</strong> ${escapeHtml(inquiry.full_name)}<br/>
              <strong>Email:</strong> ${escapeHtml(inquiry.email)}<br/>
              <strong>Phone:</strong> ${escapeHtml(inquiry.phone || "Not provided")}<br/>
              <strong>WhatsApp:</strong> ${escapeHtml(inquiry.whatsapp || "Not provided")}<br/>
              <strong>Country:</strong> ${escapeHtml(inquiry.country_of_residence || "Not provided")}
            </p>

            <h2>Property Inquiry</h2>
            <p>
              <strong>Inquiry ID:</strong> ${escapeHtml(inquiry.id)}<br/>
              <strong>Property ID:</strong> ${escapeHtml(inquiry.property_id)}<br/>
              <strong>Preferred visit date:</strong>
              ${escapeHtml(inquiry.preferred_visit_date || "Not specified")}
            </p>

            <h2>Buyer Message</h2>
            <p>${escapeHtml(inquiry.message || "No message").replace(/\n/g, "<br/>")}</p>

            <p style="margin-top:30px">
              <a href="${escapeHtml(adminUrl)}"
                 style="background:#166534;color:white;padding:12px 20px;text-decoration:none;border-radius:8px">
                Open FasoHome Admin
              </a>
            </p>
          </div>
        `,
      },
      {
        idempotencyKey: `fasohome-property-inquiry-${inquiry.id}`,
      }
    );

    if (sendError) {
      console.error("Resend rejected notification:", sendError);

      // Do not immediately release the claim:
      // some errors may have an uncertain delivery outcome.
      return NextResponse.json(
        { error: "Email provider error" },
        { status: 500 }
      );
    }

    const { data: completed, error: completionError } =
      await supabase.rpc("complete_property_inquiry_notification", {
        target_inquiry_id: inquiryId,
        target_processing_token: processingToken,
      });

    if (completionError || !completed) {
      console.error("Notification completion failed:", completionError);
      return NextResponse.json(
        { error: "Email accepted but tracking update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Property inquiry notification error:", error);

    // Keep an uncertain claim for later retry rather than
    // immediately risking a duplicate email.
    return NextResponse.json(
      { error: "Notification processing failed" },
      { status: 500 }
    );
  }
}
