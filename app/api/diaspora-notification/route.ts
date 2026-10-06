import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      whatsapp,
      countryOfResidence,
      serviceType,
      propertyLocation,
      propertyLink,
      message,
    } = body;

    if (
      !fullName ||
      !email ||
      !countryOfResidence ||
      !serviceType ||
      !message
    ) {
      return NextResponse.json(
        { error: "Missing required information." },
        { status: 400 }
      );
    }

    const serviceLabels: Record<string, string> = {
  property_inspection: "Property Inspection",
  gps_verification: "GPS & Location Verification",
  photo_video_report: "Photo & Video Report",
  live_video_visit: "Live Video Visit",
  document_assistance: "Document Verification Assistance",
  project_monitoring: "Project Monitoring",
};

const serviceLabel = serviceLabels[serviceType] ?? serviceType;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const adminUrl = `${siteUrl}/admin`;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

    if (!adminEmail) {
      console.error("ADMIN_NOTIFICATION_EMAIL is not configured.");

      return NextResponse.json(
        { error: "Email notification is not configured." },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "FasoHome <onboarding@resend.dev>",
      to: [adminEmail],
     subject: `New FasoHome Diaspora Request — ${serviceLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h1 style="color: #166534;">New FasoHome Diaspora Request</h1>

          <p>A customer has submitted a new Diaspora service request.</p>

          <h2>Customer</h2>

          <p>
            <strong>Name:</strong> ${escapeHtml(fullName)}<br />
            <strong>Email:</strong> ${escapeHtml(email)}<br />
            <strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}<br />
            <strong>WhatsApp:</strong> ${escapeHtml(
              whatsapp || "Not provided"
            )}<br />
            <strong>Country:</strong> ${escapeHtml(countryOfResidence)}
          </p>

          <h2>Request</h2>

          <p>
           <strong>Service:</strong> ${escapeHtml(serviceLabel)}<br />
            <strong>Property location:</strong> ${escapeHtml(
              propertyLocation || "Not provided"
            )}<br />
            <strong>Property link:</strong> ${escapeHtml(
              propertyLink || "Not provided"
            )}
          </p>

         <h2>Customer message</h2>

<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>

<p style="margin-top: 30px;">
  <a
    href="${escapeHtml(adminUrl)}"
    style="
      display: inline-block;
      background-color: #166534;
      color: white;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
    "
  >
    Open FasoHome Admin
  </a>
</p>

<hr style="margin-top: 30px;" />

          <p style="font-size: 13px; color: #666;">
            This notification was generated automatically by FasoHome.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return NextResponse.json(
        { error: "Unable to send notification." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Diaspora notification error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}