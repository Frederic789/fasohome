import Image from "next/image";
import Link from "next/link";

import Header from "../components/Header";
import { supabase } from "../lib/supabase";

type Agency = {
  id: string;
  agency_name: string;
  agency_address: string | null;
  agency_description: string | null;
  agency_logo_url: string | null;
  is_verified: boolean;
};

export default async function AgenciesPage() {
  const { data, error } = await supabase
    .from("public_agencies")
    .select(
      `
      id,
      agency_name,
      agency_address,
      agency_description,
      agency_logo_url,
      is_verified
      `
    )
    .order("agency_name", { ascending: true });

  if (error) {
    console.error("Agencies loading error:", error);
  }

  const agencies = (data || []) as Agency[];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-green-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">
            FasoHome Agencies
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Real Estate Agencies in Burkina Faso
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-green-100">
            Discover real estate agencies and professionals listing
            properties on FasoHome.
          </p>
        </div>
      </section>

      {/* Agencies */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Browse agencies
          </h2>

          <p className="mt-2 text-gray-600">
            Explore agencies and view their available properties.
          </p>
        </div>

        {agencies.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900">
              No agencies available yet
            </h3>

            <p className="mt-2 text-gray-600">
              Registered real estate agencies will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <article
                key={agency.id}
                className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {agency.agency_logo_url ? (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white">
                      <Image
                        src={agency.agency_logo_url}
                        alt={`${agency.agency_name} logo`}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-green-100 text-2xl font-bold text-green-800">
                      {agency.agency_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {agency.agency_name}
                      </h3>

                      {agency.is_verified && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    {agency.agency_address && (
                      <p className="mt-2 text-sm text-gray-500">
                        {agency.agency_address}
                      </p>
                    )}
                  </div>
                </div>

                {agency.agency_description && (
                  <p className="mt-5 line-clamp-3 leading-7 text-gray-600">
                    {agency.agency_description}
                  </p>
                )}

                <div className="mt-auto pt-6">
                  <Link
                    href={`/agencies/${agency.id}`}
                    className="block rounded-lg bg-green-700 px-5 py-3 text-center font-bold text-white hover:bg-green-800"
                  >
                    View Agency
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}