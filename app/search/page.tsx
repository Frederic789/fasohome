import Image from "next/image";
import Link from "next/link";

import Header from "../components/Header";
import FavoriteButton from "../components/FavoriteButton";
import { supabase } from "../lib/supabase";

type SearchPageProps = {
  searchParams: Promise<{
    type?: string;
    propertyType?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    sort?: string;
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
const propertyType = params.propertyType || "";
const location = params.location?.trim() || "";

const minPrice = Number(params.minPrice || 0);
const maxPrice = Number(params.maxPrice || 0);
const bedrooms = Number(params.bedrooms || 0);

const sort = params.sort || "newest";
  

  

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "approved")
   

 if (type) {
  query = query.eq("transaction_type", type);
}

if (propertyType) {
  query = query.eq("property_type", propertyType);
}

if (location) {
  query = query.or(
    `city.ilike.%${location}%,neighborhood.ilike.%${location}%,sector.ilike.%${location}%,landmark.ilike.%${location}%`
  );
}

if (minPrice > 0) {
  query = query.gte("price", minPrice);
}

if (maxPrice > 0) {
  query = query.lte("price", maxPrice);
}

if (bedrooms > 0) {
  query = query.gte("bedrooms", bedrooms);
}

if (sort === "price-low") {
  query = query.order("price", {
    ascending: true,
  });
} else if (sort === "price-high") {
  query = query.order("price", {
    ascending: false,
  });
} else {
  query = query.order("created_at", {
    ascending: false,
  });
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

              

      {/* NEW FILTER FORM GOES HERE */}

      

<form
  action="/search"
  method="GET"
  className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        Buy or Rent
      </span>
      <select
        name="type"
        defaultValue={type}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
      >
        <option value="">All listings</option>
        <option value="sale">Buy</option>
<option value="rent">Rent</option>
      </select>
    </label>

    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        City or neighborhood
      </span>
      <input
        type="text"
        name="location"
        defaultValue={location}
        placeholder="e.g. Ouagadougou"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500"
      />
    </label>

    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        Property type
      </span>
      <select
        name="propertyType"
        defaultValue={propertyType}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
      >
        <option value="">All property types</option>
       <option value="villa">House / Villa</option>
<option value="apartment">Apartment</option>
<option value="land">Land</option>
      </select>
    </label>

    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        Minimum price (FCFA)
      </span>
      <input
        type="number"
        name="minPrice"
        min="0"
        defaultValue={params.minPrice || ""}
        placeholder="No minimum"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500"
      />
    </label>

    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        Maximum price (FCFA)
      </span>
      <input
        type="number"
        name="maxPrice"
        min="0"
        defaultValue={params.maxPrice || ""}
        placeholder="No maximum"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500"
      />
    </label>

    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        Minimum bedrooms
      </span>
      <select
        name="bedrooms"
        defaultValue={params.bedrooms || ""}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
      >
        <option value="">Any bedrooms</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
        <option value="5">5+</option>
      </select>
    </label>

    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        Sort results
      </span>
      <select
        name="sort"
        defaultValue={sort}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900"
      >
        <option value="newest">Newest first</option>
        <option value="price-low">Price: low to high</option>
        <option value="price-high">Price: high to low</option>
      </select>
    </label>
  </div>

  <div className="mt-6 flex flex-wrap gap-3">
    <button
      type="submit"
      className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
    >
      Search Properties
    </button>

    <Link
      href="/search"
      className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
    >
      Clear Filters
    </Link>
  </div>
</form>


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