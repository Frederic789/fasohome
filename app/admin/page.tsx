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
          <section className="grid gap-5 md:grid-cols-2">
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
        </div>
      </main>
    </>
  );
}