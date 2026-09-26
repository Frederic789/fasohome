"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import { supabase } from "../../lib/supabase";

type AgencyProfile = {
  id: string;
  full_name: string | null;
  account_type: string;
  agency_name: string | null;
  agency_phone: string | null;
  agency_whatsapp: string | null;
  agency_address: string | null;
  agency_description: string | null;
  agency_logo_url: string | null;
  is_verified: boolean;
};

type Property = {
  id: number;
  title: string;
  price: number;
  city: string;
  neighborhood: string;
  status: string;
  image_urls: string[] | null;
  created_at: string;
};

export default function AgencyDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          account_type,
          agency_name,
          agency_phone,
          agency_whatsapp,
          agency_address,
          agency_description,
          agency_logo_url,
          is_verified
          `
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        setErrorMessage("Unable to load your agency profile.");
        setLoading(false);
        return;
      }

      if (profileData.account_type !== "agency") {
        router.push("/profile");
        return;
      }

      setProfile(profileData);

      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .select(
          `
          id,
          title,
          price,
          city,
          neighborhood,
          status,
          image_urls,
          created_at
          `
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (propertyError) {
        console.error("Property error:", propertyError);
        setErrorMessage("Unable to load your properties.");
        setLoading(false);
        return;
      }

      setProperties(propertyData || []);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-gray-600">Loading agency dashboard...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-xl bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        </div>
      </main>
    );
  }

  const totalListings = properties.length;

  const approvedListings = properties.filter(
    (property) => property.status === "approved"
  ).length;

  const pendingListings = properties.filter(
    (property) => property.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-green-900 px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
            Agency Dashboard
          </p>

          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="flex items-center gap-5">
  {profile?.agency_logo_url ? (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
      <Image
        src={profile.agency_logo_url}
        alt={`${profile.agency_name || "Agency"} logo`}
        fill
        sizes="96px"
        className="object-contain p-2"
      />
    </div>
  ) : (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-center text-xs font-semibold text-green-100">
      Agency
      <br />
      Logo
    </div>
  )}

  <div>
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-3xl font-bold md:text-4xl">
        {profile?.agency_name || profile?.full_name || "Your Agency"}
      </h1>

      {profile?.is_verified && (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
          ✓ Verified
        </span>
      )}
    </div>

    {profile?.agency_address && (
      <p className="mt-3 text-green-100">
        {profile.agency_address}
      </p>
    )}
  </div>
</div>

            <Link
              href="/list-property"
              className="rounded-lg bg-yellow-500 px-6 py-3 text-center font-bold text-gray-950 hover:bg-yellow-400"
            >
              + Add property
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total listings"
            value={totalListings}
          />

          <StatCard
            title="Approved"
            value={approvedListings}
          />

          <StatCard
            title="Pending review"
            value={pendingListings}
          />
        </div>

        <div className="mt-12 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your properties
            </h2>

            <p className="mt-1 text-gray-600">
              Manage the properties listed by your agency.
            </p>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900">
              No properties yet
            </h3>

            <p className="mt-2 text-gray-600">
              Add your first property to start building your agency portfolio.
            </p>

            <Link
              href="/list-property"
              className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"
            >
              List your first property
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <article
                key={property.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="relative h-48">
                  <Image
                    src={
                      property.image_urls?.[0] ||
                      "/images/villa-ouaga-1.jpg"
                    }
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-900">
                      {property.title}
                    </h3>

                    <StatusBadge status={property.status} />
                  </div>

                  <p className="mt-3 text-xl font-bold text-green-800">
                    {Number(property.price).toLocaleString()} FCFA
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {property.neighborhood}, {property.city}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/properties/${property.id}`}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </Link>

                    <Link
                      href={`/my-properties/${property.id}/edit`}
                      className="flex-1 rounded-lg bg-green-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-800"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
        Approved
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
        Pending
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
      {status}
    </span>
  );
}