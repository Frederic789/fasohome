"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import Header from "../../components/Header";
import { supabase } from "../../lib/supabase";

const serviceOptions = [
  {
    value: "property_inspection",
    label: "Property Inspection",
  },
  {
    value: "gps_verification",
    label: "GPS & Location Verification",
  },
  {
    value: "photo_video_report",
    label: "Photo & Video Report",
  },
  {
    value: "live_video_visit",
    label: "Live Video Visit",
  },
  {
    value: "document_assistance",
    label: "Document Verification Assistance",
  },
  {
    value: "project_monitoring",
    label: "Project Monitoring",
  },
];

export default function DiasporaRequestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyLink, setPropertyLink] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        setEmail(currentUser.email ?? "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone_number, whatsapp_number")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profile) {
          setFullName(profile.full_name ?? "");
          setPhone(profile.phone_number ?? "");
          setWhatsapp(profile.whatsapp_number ?? "");
        }
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setErrorMessage("You must be signed in to submit a request.");
      return;
    }

    if (
      !fullName.trim() ||
      !email.trim() ||
      !countryOfResidence.trim() ||
      !serviceType ||
      !message.trim()
    ) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const { error } = await supabase.from("diaspora_requests").insert({
      user_id: user.id,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      country_of_residence: countryOfResidence.trim(),
      service_type: serviceType,
      property_location: propertyLocation.trim() || null,
      property_link: propertyLink.trim() || null,
      message: message.trim(),
    });

    if (error) {
  console.error("Diaspora request error:", error);
  setErrorMessage(
    "We could not submit your request. Please try again."
  );
  setSubmitting(false);
  return;
}

try {
  const notificationResponse = await fetch("/api/diaspora-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      countryOfResidence: countryOfResidence.trim(),
      serviceType,
      propertyLocation: propertyLocation.trim(),
      propertyLink: propertyLink.trim(),
      message: message.trim(),
    }),
  });

  if (!notificationResponse.ok) {
    console.error(
      "Diaspora request was saved, but admin notification failed."
    );
  }
} catch (notificationError) {
  console.error(
    "Diaspora request was saved, but admin notification failed:",
    notificationError
  );
}

setSuccess(true);
setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <section className="px-6 py-20">
          <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="font-semibold uppercase tracking-widest text-green-700">
              FasoHome Diaspora
            </p>

            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              Sign in to submit a request
            </h1>

            <p className="mt-4 leading-7 text-gray-600">
              Your Diaspora request will be securely connected to your
              FasoHome account so you can track it later.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login?redirect=/diaspora/request"
                className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="rounded-lg border border-green-700 px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>

            <p className="mt-6 font-semibold uppercase tracking-widest text-green-700">
              FasoHome Diaspora
            </p>

            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              Request received
            </h1>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
              Thank you. Your Diaspora service request has been submitted
              successfully. FasoHome will review the information you provided
              and follow up with you about the next steps.
            </p>

            <Link
              href="/diaspora"
              className="mt-8 inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Back to FasoHome Diaspora
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-green-900 px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="font-semibold uppercase tracking-widest text-yellow-400">
            FasoHome Diaspora
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Request a service
          </h1>

          <p className="mt-4 max-w-2xl text-green-100">
            Tell us what you need and provide as much information as possible
            about the property or project.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm md:p-10">
          <div className="border-b border-gray-200 pb-6">
            <p className="text-sm font-semibold text-green-700">
              Signed in as
            </p>

            <p className="mt-1 text-gray-700">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Contact information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Contact information
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Tell us how we can contact you about your request.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <FormField label="Full name" required>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={inputStyle}
                  />
                </FormField>

                <FormField label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputStyle}
                  />
                </FormField>

                <FormField label="Phone number">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1..."
                    className={inputStyle}
                  />
                </FormField>

                <FormField label="WhatsApp number">
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+1..."
                    className={inputStyle}
                  />
                </FormField>

                <FormField label="Country of residence" required>
                  <input
                    type="text"
                    value={countryOfResidence}
                    onChange={(e) =>
                      setCountryOfResidence(e.target.value)
                    }
                    placeholder="Example: United States"
                    required
                    className={inputStyle}
                  />
                </FormField>
              </div>
            </div>

            {/* Service */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900">
                Service needed
              </h2>

              <div className="mt-6">
                <FormField label="Select a service" required>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    required
                    className={inputStyle}
                  >
                    <option value="">Choose a service</option>

                    {serviceOptions.map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            {/* Property */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900">
                Property or project information
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                If you already know the property or project, provide the
                information below.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <FormField label="Property location">
                  <input
                    type="text"
                    value={propertyLocation}
                    onChange={(e) =>
                      setPropertyLocation(e.target.value)
                    }
                    placeholder="Example: Ouaga 2000, Ouagadougou"
                    className={inputStyle}
                  />
                </FormField>

                <FormField label="Property link">
                  <input
                    type="url"
                    value={propertyLink}
                    onChange={(e) => setPropertyLink(e.target.value)}
                    placeholder="https://..."
                    className={inputStyle}
                  />
                </FormField>
              </div>
            </div>

            {/* Message */}
            <div className="border-t border-gray-200 pt-8">
              <FormField
                label="Tell us about your request"
                required
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="Describe the property, project, questions you have, and what you would like FasoHome to verify or document."
                  className={inputStyle}
                />
              </FormField>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/diaspora"
                className="font-semibold text-green-700 hover:text-green-800"
              >
                ← Back to FasoHome Diaspora
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-green-700 px-7 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

const inputStyle =
  "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100";

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-800">
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
      {children}
    </label>
  );
}