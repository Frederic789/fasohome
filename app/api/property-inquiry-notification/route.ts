
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type InquiryRecord = {
  id: number;
  property_id: number;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  country_of_residence: string | null;
  preferred_visit_date: string | null;
  message: string | null;
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const secret = process.env.PROPERTY_INQUIRY_WEBHOOK_SECRET;
    const providedSecret = request.headers.get("x-webhook-secret");

    if (!secret || !providedSecret || providedSecret !== secret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Supabase Database Webhook sends the inserted row in "record".
    if (body.type !== "INSERT" || body.table !== "property_inquiries") {
      return NextResponse.json(
        { error: "Unsupported webhook event" },
        { status: 400 }
      );
    }

    const inquiry = body.record as InquiryRecord | undefined;

    if (
      !inquiry ||
      !inquiry.id ||
      !inquiry.property_id ||
      !inquiry.full_name ||
      !inquiry.email
    ) {
      return NextResponse.json(
        { error: "Invalid inquiry record" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

    if (!apiKey || !adminEmail) {
      console.error("Email environment variables are missing.");
      return NextResponse.json(
        { error: "Email notification is not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const adminUrl = `${siteUrl.replace(/\/$/, "")}/admin`;

    const { data, error } = await resend.emails.send({
      from: "FasoHome <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New FasoHome Property Inquiry #${inquiry.id}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
          <h1 style="color:#166534">New Property Inquiry</h1>
          <p>A buyer has submitted an inquiry through FasoHome.</p>

          <h2>Buyer Information</h2>
          <p>
            <strong>Name:</strong> ${escapeHtml(inquiry.full_name)}<br/>
            <strong>Email:</strong> ${escapeHtml(inquiry.email)}<br/>
            <strong>Phone:</strong> ${escapeHtml(inquiry.phone)}<br/>
            <strong>WhatsApp:</strong> ${escapeHtml(inquiry.whatsapp || "Not provided")}<br/>
            <strong>Country:</strong> ${escapeHtml(inquiry.country_of_residence || "Not provided")}
          </p>

          <h2>Property Inquiry</h2>
          <p>
            <strong>Inquiry ID:</strong> ${escapeHtml(inquiry.id)}<br/>
            <strong>Property ID:</strong> ${escapeHtml(inquiry.property_id)}<br/>
            <strong>Preferred visit date:</strong> ${escapeHtml(inquiry.preferred_visit_date || "Not specified")}
          </p>

          <h2>Buyer Message</h2>
          <p>${escapeHtml(inquiry.message || "No message").replace(/\n/g, "<br/>")}</p>

          <p style="margin-top:30px">
            <a href="${escapeHtml(adminUrl)}"
               style="background:#166534;color:white;padding:12px 20px;text-decoration:none;border-radius:8px">
              Open FasoHome Admin
            </a>
          </p>

          <p style="font-size:12px;color:#666">
            This notification was generated automatically by FasoHome.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Unable to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Property inquiry notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
