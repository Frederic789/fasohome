import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { properties } from "../../data/properties";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  const { id } = await params;

  const property = properties.find(
    (item) => item.id === Number(id)
  );

  if (!property) {
    notFound();
  }

  const whatsappMessage = encodeURIComponent(
    `Hello, I am interested in ${property.title} listed on FasoHome.`
  );

  const whatsappLink =
    `https://wa.me/${property.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold text-green-700"
          >
            FasoHome
          </Link>

          <Link
            href="/#properties"
            className="font-semibold text-gray-700 hover:text-green-700"
          >
            Back to properties
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/#properties"
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          ← Back to properties
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="relative h-[320px] w-full md:h-[520px]">
            <Image
              src={property.image}
              alt={property.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="grid gap-10 p-6 md:p-10 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
                    {property.propertyType}
                  </p>

                  <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                    {property.title}
                  </h1>

                  <p className="mt-3 text-lg text-gray-600">
                    {property.location}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
                  {property.trustScore}% trusted
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailBox
                  label="Price"
                  value={property.price}
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

              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  About this property
                </h2>

                <p className="mt-4 max-w-3xl leading-8 text-gray-600">
                  {property.description}
                </p>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  Property features
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Feature
                    label="Running water"
                    available={property.hasWater}
                  />

                  <Feature
                    label="Electricity"
                    available={property.hasElectricity}
                  />

                  <Feature
                    label="Parking"
                    available={property.hasParking}
                  />

                  <Feature
                    label="Paved-road access"
                    available={property.pavedRoadAccess}
                  />
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-500">
                Listed price
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {property.price}
              </p>

              <p className="mt-5 text-sm leading-6 text-gray-600">
                Contact the advertiser or request a property visit before
                making any payment.
              </p>

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
            </aside>
          </div>
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
    <div className="rounded-xl bg-gray-100 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-bold text-gray-900">{value}</p>
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
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
      <span
        className={
          available
            ? "text-lg text-green-700"
            : "text-lg text-gray-400"
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