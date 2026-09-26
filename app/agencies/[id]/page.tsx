import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "../../components/Header";
import { supabase } from "../../lib/supabase";

type Agency = {
  id: string;
  agency_name: string;
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
  transaction_type: string;
  property_type: string;
  price: number;
  city: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  image_urls: string[] | null;
};

export default async function PublicAgencyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: agency, error: agencyError } = await supabase
    .from("public_agencies")
    .select(
      `
      id,
      agency_name,
      agency_phone,
      agency_whatsapp,
      agency_address,
      agency_description,
      agency_logo_url,
      is_verified
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (agencyError) {
    console.error("Agency error:", agencyError);
  }

  if (!agency) {
    notFound();
  }

  const { data: properties, error: propertyError } = await supabase
    .from("properties")
    .select(
      `
      id,
      title,
      transaction_type,
      property_type,
      price,
      city,
      neighborhood,
      bedrooms,
      bathrooms,
      image_urls
      `
    )
    .eq("owner_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (propertyError) {
    console.error("Agency properties error:", propertyError);
  }

  const agencyProperties: Property[] = properties || [];

  const whatsappNumber = agency.agency_whatsapp?.replace(/\D/g, "");

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-green-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {agency.agency_logo_url ? (
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm">
                <Image
                  src={agency.agency_logo_url}
                  alt={`${agency.agency_name} logo`}
                  fill
                  sizes="128px"
                  className="object-contain p-3"
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-center font-semibold text-green-100">
                Agency
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold md:text-5xl">
                  {agency.agency_name}
                </h1>

                {agency.is_verified && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">
                    ✓ Verified Agency
                  </span>
                )}
              </div>

              {agency.agency_address && (
                <p className="mt-4 text-lg text-green-100">
                  {agency.agency_address}
                </p>
              )}

              {agency.agency_description && (
                <p className="mt-5 max-w-3xl leading-7 text-green-50">
                  {agency.agency_description}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                {agency.agency_phone && (
                  <a
                    href={`tel:${agency.agency_phone}`}
                    className="rounded-lg bg-white px-5 py-3 font-bold text-green-900 hover:bg-gray-100"
                  >
                    Call agency
                  </a>
                )}

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-green-500 px-5 py-3 font-bold text-white hover:bg-green-600"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Properties from {agency.agency_name}
          </h2>

          <p className="mt-2 text-gray-600">
            Browse approved properties listed by this agency.
          </p>
        </div>

        {agencyProperties.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900">
              No approved properties yet
            </h3>

            <p className="mt-2 text-gray-600">
              This agency does not currently have any approved listings.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agencyProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-56">
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
                    <h3 className="text-lg font-bold text-gray-900">
                      {property.title}
                    </h3>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold capitalize text-green-800">
                      {property.transaction_type === "sale"
                        ? "For sale"
                        : "For rent"}
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-bold text-green-800">
                    {Number(property.price).toLocaleString()} FCFA
                    {property.transaction_type === "rent" && (
                      <span className="text-sm font-medium text-gray-500">
                        {" "}
                        / month
                      </span>
                    )}
                  </p>

                  <p className="mt-2 text-gray-600">
                    {property.neighborhood}, {property.city}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    {property.property_type !== "land" &&
                      property.bedrooms > 0 && (
                        <span>{property.bedrooms} bedrooms</span>
                      )}

                    {property.property_type !== "land" &&
                      property.bathrooms > 0 && (
                        <span>{property.bathrooms} bathrooms</span>
                      )}

                    <span className="capitalize">
                      {property.property_type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}