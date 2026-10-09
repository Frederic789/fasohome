
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import { supabase } from "../../../lib/supabase";

export default function PropertyInquiryPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = String(params.id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace(
          `/login?redirect=/properties/${propertyId}/inquire`
        );
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone_number, whatsapp_number")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone_number ?? "");
        setWhatsapp(profile.whatsapp_number ?? "");
      }

      setLoading(false);
    }

    loadUser();
  }, [propertyId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("Please sign in first.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from("property_inquiries")
      .insert({
        property_id: Number(propertyId),
        user_id: userId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || null,
        country_of_residence: country.trim() || null,
        preferred_visit_date: visitDate || null,
        message: message.trim() || null,
      });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <p className="p-10 text-center">
          Loading your inquiry form...
        </p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <section className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-green-800">
            Request received!
          </h1>
          <p className="mt-4 text-gray-600">
            Thank you for contacting FasoHome. Our team will
            review your inquiry and contact you to discuss
            the property and next steps.
          </p>
          <Link
            href={`/properties/${propertyId}`}
            className="mt-8 inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white"
          >
            Back to property
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href={`/properties/${propertyId}`}
          className="text-sm font-semibold text-green-700"
        >
          ← Back to property
        </Link>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm md:p-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Interested in this property?
          </h1>

          <p className="mt-3 text-gray-600">
            Complete this form and a FasoHome representative
            will contact you to arrange a visit, discuss
            the property, and assist you with the process.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label="Full name" value={fullName} onChange={setFullName} required />
            <Field label="Email" value={email} onChange={setEmail} type="email" required />
            <Field label="Phone number" value={phone} onChange={setPhone} required />
            <Field label="WhatsApp number" value={whatsapp} onChange={setWhatsapp} />
            <Field label="Country of residence" value={country} onChange={setCountry} />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Preferred visit date (optional)
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Tell us how we can assist you..."
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Send inquiry to FasoHome"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border px-4 py-3"
      />
    </div>
  );
}
