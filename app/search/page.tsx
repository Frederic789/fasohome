import Image from "next/image";
import Link from "next/link";

import Header from "../components/Header";
import FavoriteButton from "../components/FavoriteButton";
import { supabase } from "../lib/supabase";

type SearchPageProps = {
  searchParams: Promise<{
    type?: string;
    location?: string;
  }>;
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
  area: number;
  image_urls: string[] | null;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const type = params.type || "";
  const location = params.location?.trim() || "";

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (type === "rent") {
    query = query.eq("transaction_type", "rent");
  }

  if (type === "sale") {
    query = query.eq("transaction_type", "sale");
  }

  if (type === "land") {
    query = query.eq("property_type", "land");
  }

  if (location) {
    query = query.or(
      `city.ilike.%${location}%,neighborhood.ilike.%${location}%,sector.ilike.%${location}%,landmark.ilike.%${location}%`
    );
  }

  const { data: properties, error } = await query;

  if (error) {
    console.error("Search error:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Search results
          </h1>

          <p className="mt-2 text-gray-600">
            {type && `Type: ${type}`}
            {type && location && " • "}
            {location && `Location: ${location}`}
          </p>
        </div>

        {!properties || properties.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              No properties found
            </h2>

            <p className="mt-2 text-gray-600">
              Try another city, neighborhood, or property type.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property: Property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="block"
              >
                <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-56 w-full">
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

                    <div className="absolute right-3 top-3">
                      <FavoriteButton propertyId={property.id} />
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900">
                      {Number(property.price).toLocaleString()} FCFA
                    </h2>

                    <p className="mt-3 font-semibold text-gray-800">
                      {property.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {property.bedrooms} bedrooms •{" "}
                      {property.bathrooms} bathrooms •{" "}
                      {property.area} m²
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {property.neighborhood}, {property.city}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}