"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";

type Property = {
  id: number;
  title: string;
  price: number;
  city: string;
  neighborhood: string | null;
  transaction_type: string;
  property_type: string;
  status: string;
  owner_id: string | null;
  created_at: string;
};

type Agency = {
  id: string;
  agency_name: string;
  agency_address: string | null;
  agency_logo_url: string | null;
  is_verified: boolean;
};

type DiasporaRequest = {
  id: number;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country_of_residence: string;
  service_type: string;
  property_id: number | null;
  property_location: string | null;
  property_link: string | null;
  message: string;
  status:
    | "new"
    | "reviewing"
    | "in_progress"
    | "completed"
    | "cancelled";
  created_at: string;
  updated_at: string;
};


type PropertyInquiry = {
  id: number;
  property_id: number;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  country_of_residence: string | null;
  preferred_visit_date: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};


export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [error, setError] = useState("");
  const [verifyingAgencyId, setVerifyingAgencyId] = useState<string | null>(
  null
);
const [updatingPropertyId, setUpdatingPropertyId] = useState<number | null>(
  null
);

const [diasporaRequests, setDiasporaRequests] = useState<DiasporaRequest[]>([]);

const [propertyInquiries, setPropertyInquiries] =
  useState<PropertyInquiry[]>([]);

  const [updatingInquiryId, setUpdatingInquiryId] =
  useState<number | null>(null);

const [updatingDiasporaId, setUpdatingDiasporaId] = useState<number | null>(
  null
);

  useEffect(() => {
    async function loadAdminDashboard() {
      setLoading(true);
      setError("");

      // 1. Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?redirect=/admin");
        return;
      }

      // 2. Check admin status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
        setError("Unable to verify administrator access.");
        setLoading(false);
        return;
      }

      if (!profile?.is_admin) {
        router.replace("/");
        return;
      }

      setIsAdmin(true);

      // 3. Load pending properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select(
          `
            id,
            title,
            price,
            city,
            neighborhood,
            transaction_type,
            property_type,
            status,
            owner_id,
            created_at
          `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (propertiesError) {
        console.error("Properties error:", propertiesError);
        setError("Unable to load pending properties.");
      } else {
        setPendingProperties(propertiesData ?? []);
      }

      // 4. Load agencies waiting for verification
      const { data: agenciesData, error: agenciesError } = await supabase
        .from("public_agencies")
        .select(
          `
            id,
            agency_name,
            agency_address,
            agency_logo_url,
            is_verified
          `
        )
        .eq("is_verified", false)
        .order("created_at", { ascending: false });

      if (agenciesError) {
        console.error("Agencies error:", agenciesError);
        setError((current) =>
          current
            ? `${current} Unable to load agencies.`
            : "Unable to load agencies."
        );
      } else {
        setAgencies(agenciesData ?? []);
      }

      // 5. Load Diaspora service requests
const {
  data: diasporaData,
  error: diasporaError,
} = await supabase.rpc("admin_get_diaspora_requests");

if (diasporaError) {
  console.error("Diaspora requests error:", diasporaError);

  setError((current) =>
    current
      ? `${current} Unable to load Diaspora requests.`
      : "Unable to load Diaspora requests."
  );
} else {
  setDiasporaRequests(
    (diasporaData as DiasporaRequest[] | null) ?? []
  );
}


    

      
// 6. Load property inquiries for administrators
const { data: inquiryData, error: inquiryError } =
  await supabase.rpc("admin_get_property_inquiries");

if (inquiryError) {
  console.error("Property inquiries error:", inquiryError);
  setError((current) =>
    current
      ? `${current} Unable to load property inquiries.`
      : "Unable to load property inquiries."
  );
} else {
  setPropertyInquiries(
    (inquiryData as PropertyInquiry[] | null) ?? []
  );
}

setLoading(false);

    }

    loadAdminDashboard();
  }, [router]);

  async function handleVerifyAgency(agencyId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to verify this agency?"
  );

  if (!confirmed) return;

  setVerifyingAgencyId(agencyId);
  setError("");

  const { error: verificationError } = await supabase.rpc(
    "admin_set_agency_verification",
    {
      target_agency_id: agencyId,
      verified: true,
    }
  );

  if (verificationError) {
    console.error("Verification error:", verificationError);
    setError(verificationError.message);
    setVerifyingAgencyId(null);
    return;
  }

  // Remove the newly verified agency from the waiting list
  setAgencies((currentAgencies) =>
    currentAgencies.filter((agency) => agency.id !== agencyId)
  );

  setVerifyingAgencyId(null);
}

async function handlePropertyStatus(
  propertyId: number,
  newStatus: "approved" | "rejected"
) {
  const action = newStatus === "approved" ? "approve" : "reject";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} this property?`
  );

  if (!confirmed) return;

  setUpdatingPropertyId(propertyId);
  setError("");

  const { error: statusError } = await supabase.rpc(
    "admin_set_property_status",
    {
      target_property_id: propertyId,
      new_status: newStatus,
    }
  );

  if (statusError) {
    console.error("Property status error:", statusError);
    setError(statusError.message);
    setUpdatingPropertyId(null);
    return;
  }

  setPendingProperties((currentProperties) =>
    currentProperties.filter((property) => property.id !== propertyId)
  );

  setUpdatingPropertyId(null);
}

async function handleDiasporaStatus(
  requestId: number,
  newStatus:
    | "new"
    | "reviewing"
    | "in_progress"
    | "completed"
    | "cancelled"
) {
  setUpdatingDiasporaId(requestId);
  setError("");

  const { error: statusError } = await supabase.rpc(
    "admin_set_diaspora_request_status",
    {
      target_request_id: requestId,
      new_status: newStatus,
    }
  );

  if (statusError) {
    console.error("Diaspora status error:", statusError);
    setError(statusError.message);
    setUpdatingDiasporaId(null);
    return;
  }

  setDiasporaRequests((currentRequests) =>
    currentRequests.map((request) =>
      request.id === requestId
        ? {
            ...request,
            status: newStatus,
            updated_at: new Date().toISOString(),
          }
        : request
    )
  );

  setUpdatingDiasporaId(null);
}


async function handleInquiryStatus(
  inquiryId: number,
  newStatus: string
) {
  setUpdatingInquiryId(inquiryId);
  setError("");

  const { error: statusError } = await supabase.rpc(
    "admin_set_property_inquiry_status",
    {
      target_inquiry_id: inquiryId,
      new_status: newStatus,
    }
  );

  if (statusError) {
    console.error("Inquiry status error:", statusError);
    setError(statusError.message);
    setUpdatingInquiryId(null);
    return;
  }

  setPropertyInquiries((currentInquiries) =>
    currentInquiries.map((inquiry) =>
      inquiry.id === inquiryId
        ? {
            ...inquiry,
            status: newStatus,
            updated_at: new Date().toISOString(),
          }
        : inquiry
    )
  );

  setUpdatingInquiryId(null);
}

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-gray-600">Loading administration dashboard...</p>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-green-700 text-white">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-100">
              FasoHome Administration
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-green-100">
              Review property listings and manage real estate agencies on
              FasoHome.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-10">
          {error && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Stats */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Pending properties
              </p>

              <p className="mt-2 text-4xl font-bold text-gray-900">
                {pendingProperties.length}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Agencies awaiting verification
              </p>

              <p className="mt-2 text-4xl font-bold text-gray-900">
                {agencies.length}
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
  <p className="text-sm font-medium text-gray-500">
    Diaspora requests
  </p>

  <p className="mt-2 text-4xl font-bold text-gray-900">
    {diasporaRequests.length}
  </p>

  <p className="mt-2 text-sm text-gray-500">
    {diasporaRequests.filter((request) => request.status === "new").length} new
  </p>
</div>


<div className="rounded-2xl border bg-white p-6 shadow-sm">
  <p className="text-sm font-medium text-gray-500">
    Property inquiries
  </p>

  <p className="mt-2 text-4xl font-bold text-gray-900">
    {propertyInquiries.length}
  </p>

  <p className="mt-2 text-sm text-gray-500">
    {propertyInquiries.filter(
      (inquiry) => inquiry.status === "new"
    ).length}{" "}
    new
  </p>
</div>

          </section>

          {/* Pending Properties */}
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Pending Properties
              </h2>

              <p className="mt-1 text-gray-600">
                Review new property listings before they appear publicly.
              </p>
            </div>

            {pendingProperties.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-gray-600 shadow-sm">
                No properties are currently waiting for approval.
              </div>
            ) : (
              <div className="grid gap-5">
                {pendingProperties.map((property) => (
                  <div
                    key={property.id}
                    className="rounded-2xl border bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {property.title}
                          </h3>

                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                            Pending
                          </span>
                        </div>

                        <p className="font-semibold text-green-700">
                          {Number(property.price).toLocaleString()} FCFA
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {property.neighborhood
                            ? `${property.neighborhood}, `
                            : ""}
                          {property.city}
                        </p>

                        <p className="mt-1 text-sm capitalize text-gray-500">
                          {property.transaction_type} •{" "}
                          {property.property_type}
                        </p>
                      </div>

                     <div className="flex flex-wrap gap-3">
  <Link
    href={`/properties/${property.id}`}
    className="inline-flex rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
  >
    View property
  </Link>

  <button
    type="button"
    onClick={() =>
      handlePropertyStatus(property.id, "approved")
    }
    disabled={updatingPropertyId === property.id}
    className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {updatingPropertyId === property.id
      ? "Updating..."
      : "Approve"}
  </button>

  <button
    type="button"
    onClick={() =>
      handlePropertyStatus(property.id, "rejected")
    }
    disabled={updatingPropertyId === property.id}
    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    Reject
  </button>
</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Agency Verification */}
          <section className="mt-12">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Agency Verification
              </h2>

              <p className="mt-1 text-gray-600">
                Agencies waiting for FasoHome verification.
              </p>
            </div>

            {agencies.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-gray-600 shadow-sm">
                No agencies are currently waiting for verification.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {agencies.map((agency) => (
                  <div
                    key={agency.id}
                    className="rounded-2xl border bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {agency.agency_logo_url ? (
                        <img
                          src={agency.agency_logo_url}
                          alt={agency.agency_name}
                          className="h-16 w-16 rounded-xl border object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-100 text-xl font-bold text-green-700">
                          {agency.agency_name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {agency.agency_name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                          {agency.agency_address || "Address not provided"}
                        </p>

                        <span className="mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                          Not verified
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
  <Link
    href={`/agencies/${agency.id}`}
    className="inline-flex rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
  >
    View agency
  </Link>

  <button
    type="button"
    onClick={() => handleVerifyAgency(agency.id)}
    disabled={verifyingAgencyId === agency.id}
    className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {verifyingAgencyId === agency.id
      ? "Verifying..."
      : "Verify agency"}
  </button>
</div>
                  </div>
                ))}
              </div>
            )}
          </section>
          {/* Diaspora Requests */}
<section className="mt-12">
  <div className="mb-5">
    <h2 className="text-2xl font-bold text-gray-900">
      Diaspora Requests
    </h2>

    <p className="mt-1 text-gray-600">
      Review and manage service requests submitted through FasoHome Diaspora.
    </p>
  </div>

  {diasporaRequests.length === 0 ? (
    <div className="rounded-2xl border bg-white p-8 text-gray-600 shadow-sm">
      No Diaspora requests have been submitted yet.
    </div>
  ) : (
    <div className="grid gap-6">
      {diasporaRequests.map((request) => (
        <div
          key={request.id}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {formatServiceType(request.service_type)}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getDiasporaStatusStyle(
                    request.status
                  )}`}
                >
                  {formatDiasporaStatus(request.status)}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Request #{request.id} •{" "}
                {new Date(request.created_at).toLocaleString()}
              </p>
            </div>

            <select
              value={request.status}
              disabled={updatingDiasporaId === request.id}
              onChange={(event) =>
                handleDiasporaStatus(
                  request.id,
                  event.target.value as DiasporaRequest["status"]
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mt-6 grid gap-6 border-t border-gray-200 pt-6 md:grid-cols-2">
            <div>
              <h4 className="font-bold text-gray-900">
                Customer
              </h4>

              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {request.full_name}
                </p>

                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <a
                    href={`mailto:${request.email}`}
                    className="text-green-700 hover:underline"
                  >
                    {request.email}
                  </a>
                </p>

                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {request.phone || "Not provided"}
                </p>

                <p>
                  <span className="font-semibold">WhatsApp:</span>{" "}
                  {request.whatsapp || "Not provided"}
                </p>

                <p>
                  <span className="font-semibold">Country:</span>{" "}
                  {request.country_of_residence}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900">
                Property / Project
              </h4>

              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {request.property_location || "Not provided"}
                </p>

                <p>
                  <span className="font-semibold">Property ID:</span>{" "}
                  {request.property_id || "Not connected to a FasoHome property"}
                </p>

                {request.property_link ? (
                  <p>
                    <span className="font-semibold">Property link:</span>{" "}
                    <a
                      href={request.property_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:underline"
                    >
                      Open property link
                    </a>
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold">Property link:</span>{" "}
                    Not provided
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-bold text-gray-900">
              Customer Message
            </h4>

            <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">
              {request.message}
            </p>
          </div>

          {updatingDiasporaId === request.id && (
            <p className="mt-4 text-sm font-semibold text-green-700">
              Updating request...
            </p>
          )}
        </div>
      ))}
    </div>
  )}
</section>

{/* Property Inquiries */}
<section className="mt-12">
  <div className="mb-5">
    <h2 className="text-2xl font-bold text-gray-900">
      Property Inquiries
    </h2>
    <p className="mt-1 text-gray-600">
      Buyers requesting FasoHome assistance with a property.
    </p>
  </div>

  {propertyInquiries.length === 0 ? (
    <div className="rounded-2xl border bg-white p-8 text-gray-600 shadow-sm">
      No property inquiries have been submitted yet.
    </div>
  ) : (
    <div className="grid gap-5">
      {propertyInquiries.map((inquiry) => (
        <div
          key={inquiry.id}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-gray-900">
              Inquiry #{inquiry.id}
            </h3>

           
<select
  value={inquiry.status}
  disabled={updatingInquiryId === inquiry.id}
  onChange={(event) =>
    handleInquiryStatus(inquiry.id, event.target.value)
  }
  aria-label={`Status for inquiry ${inquiry.id}`}
  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:opacity-60"
>
  <option value="new">New</option>
  <option value="contacted">Contacted</option>
  <option value="visit_scheduled">Visit Scheduled</option>
  <option value="negotiating">Negotiating</option>
  <option value="offer_accepted">Offer Accepted</option>
  <option value="document_verification">
    Document Verification
  </option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
</select>

          </div>

          <p className="mt-2 text-sm text-gray-500">
            Submitted: {new Date(inquiry.created_at).toLocaleString()}
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="space-y-2 text-sm text-gray-700">
              <h4 className="font-bold text-gray-900">Buyer</h4>
              <p><strong>Name:</strong> {inquiry.full_name}</p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${inquiry.email}`} className="text-green-700 hover:underline">
                  {inquiry.email}
                </a>
              </p>
              <p><strong>Phone:</strong> {inquiry.phone}</p>
              <p><strong>WhatsApp:</strong> {inquiry.whatsapp || "Not provided"}</p>
              <p><strong>Country:</strong> {inquiry.country_of_residence || "Not provided"}</p>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <h4 className="font-bold text-gray-900">Property</h4>
              <p>
                <strong>Property ID:</strong> {inquiry.property_id}
              </p>
              <Link
                href={`/properties/${inquiry.property_id}`}
                className="inline-block font-semibold text-green-700 hover:underline"
              >
                View property →
              </Link>
              <p>
                <strong>Preferred visit:</strong>{" "}
                {inquiry.preferred_visit_date || "Not specified"}
              </p>
            </div>
          </div>

          {inquiry.message && (
            <div className="mt-5 border-t pt-5">
              <h4 className="font-bold text-gray-900">
                Buyer message
              </h4>
              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                {inquiry.message}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</section>


        </div>
      </main>
    </>
  );
}

function formatServiceType(serviceType: string) {
  const services: Record<string, string> = {
    property_inspection: "Property Inspection",
    gps_verification: "GPS & Location Verification",
    photo_video_report: "Photo & Video Report",
    live_video_visit: "Live Video Visit",
    document_assistance: "Document Verification Assistance",
    project_monitoring: "Project Monitoring",
  };

  return services[serviceType] ?? serviceType;
}

function formatDiasporaStatus(status: DiasporaRequest["status"]) {
  const statuses: Record<DiasporaRequest["status"], string> = {
    new: "New",
    reviewing: "Reviewing",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return statuses[status];
}

function getDiasporaStatusStyle(status: DiasporaRequest["status"]) {
  const styles: Record<DiasporaRequest["status"], string> = {
    new: "bg-blue-100 text-blue-800",
    reviewing: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return styles[status];
}