import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Header from "../../components/Header";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Property = {
  id: number;
  title: string;
    owner_id: string | null;
  transaction_type: string;
  property_type: string;
  price: number;

  city: string;
  neighborhood: string;
  sector: string | null;
  landmark: string | null;

  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;

  has_water: boolean;
  has_electricity: boolean;
  has_solar: boolean;
  has_parking: boolean;
  has_fence: boolean;
  paved_road_access: boolean;

  phone_number: string;
  whatsapp_number: string | null;

  image_urls: string[];
  status: string;
};

type PublicAgency = {
  id: string;
  agency_name: string;
  agency_address: string | null;
  agency_logo_url: string | null;
  agency_phone: string | null;
  agency_whatsapp: string | null;
  is_verified: boolean;
};

export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    console.error("Property loading error:", error);
  }

  if (!data) {
    notFound();
  }

  const property = data as Property;

  let agency: PublicAgency | null = null;

if (property.owner_id) {
  const { data: agencyData, error: agencyError } = await supabase
    .from("public_agencies")
    .select(
      `
      id,
      agency_name,
      agency_address,
      agency_logo_url,
      agency_phone,
      agency_whatsapp,
      is_verified
      `
    )
    .eq("id", property.owner_id)
    .maybeSingle();

  if (agencyError) {
    console.error("Agency loading error:", agencyError);
  }

  agency = agencyData;
}

  const whatsappNumber =
    property.whatsapp_number || property.phone_number;

  const cleanedWhatsAppNumber =
    whatsappNumber.replace(/[^\d]/g, "");

  const whatsappMessage = encodeURIComponent(
    `Hello, I am interested in ${property.title} listed on FasoHome.`
  );

  const whatsappLink =
    `https://wa.me/${cleanedWhatsAppNumber}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/#properties"
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          ← Back to properties
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
            {property.property_type}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            {property.title}
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            {property.neighborhood}, {property.city}
            {property.sector ? ` • ${property.sector}` : ""}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {property.image_urls?.length > 0 ? (
            property.image_urls.map((imageUrl, index) => (
              <div
                key={imageUrl}
                className={
                  index === 0
                    ? "relative h-105 overflow-hidden rounded-2xl md:col-span-2"
                    : "relative h-72 overflow-hidden rounded-2xl"
                }
              >
                <Image
                  src={imageUrl}
                  alt={`${property.title} photo ${index + 1}`}
                  fill
                  sizes={
                    index === 0
                      ? "100vw"
                      : "(max-width: 768px) 100vw, 50vw"
                  }
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))
          ) : (
            <div className="relative h-105 overflow-hidden rounded-2xl md:col-span-2">
              <Image
                src="/images/villa-ouaga-1.jpg"
                alt={property.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailBox
                label="Price"
                value={`${Number(property.price).toLocaleString()} FCFA`}
              />

              <DetailBox
                label="Bedrooms"
                value={String(property.bedrooms)}
              />

              <DetailBox
                label="Bathrooms"
                value={String(property.bathrooms)}
              />

              <DetailBox
                label="Area"
                value={`${property.area} m²`}
              />
            </div>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                About this property
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-gray-600">
                {property.description}
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Location
              </h2>

              <div className="mt-4 rounded-2xl border bg-white p-6">
                <p className="font-semibold text-gray-900">
                  {property.neighborhood}, {property.city}
                </p>

                {property.sector && (
                  <p className="mt-2 text-gray-600">
                    Sector: {property.sector}
                  </p>
                )}

                {property.landmark && (
                  <p className="mt-2 text-gray-600">
                    Nearby landmark: {property.landmark}
                  </p>
                )}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Amenities
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Feature
                  label="Running water"
                  available={property.has_water}
                />

                <Feature
                  label="Electricity"
                  available={property.has_electricity}
                />

                <Feature
                  label="Solar installation"
                  available={property.has_solar}
                />

                <Feature
                  label="Parking"
                  available={property.has_parking}
                />

                <Feature
                  label="Walled or fenced"
                  available={property.has_fence}
                />

                <Feature
                  label="Paved-road access"
                  available={property.paved_road_access}
                />
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-sm font-semibold text-gray-500">
              Listed price
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {Number(property.price).toLocaleString()} FCFA
            </p>

            <p className="mt-2 text-sm capitalize text-gray-500">
              For {property.transaction_type}
            </p>

            <div className="mt-6 border-t pt-6">
              <p className="text-sm font-semibold text-gray-500">
                Contact number
              </p>

              <a
                href={`tel:${property.phone_number}`}
                className="mt-1 block text-lg font-bold text-gray-900 hover:text-green-700"
              >
                {property.phone_number}
              </a>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block rounded-lg bg-green-700 px-5 py-4 text-center font-bold text-white hover:bg-green-800"
            >
              Contact on WhatsApp
            </a>

            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-yellow-500 px-5 py-4 font-bold text-gray-950 hover:bg-yellow-400"
            >
              Request a visit
            </button>

            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-gray-300 px-5 py-4 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Report this listing
            </button>

            {agency && (
  <div className="mt-6 border-t pt-6">
    <p className="text-sm font-semibold text-gray-500">
      Listed by
    </p>

    <div className="mt-4 flex items-center gap-4">
      {agency.agency_logo_url ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white">
          <Image
            src={agency.agency_logo_url}
            alt={`${agency.agency_name} logo`}
            fill
            sizes="64px"
            className="object-contain p-2"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-green-100 text-sm font-bold text-green-800">
          Agency
        </div>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-gray-900">
            {agency.agency_name}
          </p>

          {agency.is_verified && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
              ✓ Verified
            </span>
          )}
        </div>

        {agency.agency_address && (
          <p className="mt-1 text-sm text-gray-500">
            {agency.agency_address}
          </p>
        )}
      </div>
    </div>

    <Link
      href={`/agencies/${agency.id}`}
      className="mt-4 block w-full rounded-lg border border-green-700 px-5 py-3 text-center font-bold text-green-700 hover:bg-green-50"
    >
      View Agency
    </Link>
  </div>
)}

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Never send money before confirming the property,
              advertiser, and relevant documents.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

type DetailBoxProps = {
  label: string;
  value: string;
};

function DetailBox({
  label,
  value,
}: DetailBoxProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

type FeatureProps = {
  label: string;
  available: boolean;
};

function Feature({
  label,
  available,
}: FeatureProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
      <span
        className={
          available
            ? "text-xl font-bold text-green-700"
            : "text-xl text-gray-400"
        }
      >
        {available ? "✓" : "—"}
      </span>

      <span className="font-medium text-gray-700">
        {label}
      </span>
    </div>
  );
}