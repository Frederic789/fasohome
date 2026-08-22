"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Header from "../components/Header";
import { supabase } from "../lib/supabase";


type Property = {
  id: number;
  title: string;
  price: number;
  city: string;
  neighborhood: string;
  property_type: string;
  transaction_type: string;
  status: string;
  image_urls: string[] | null;
  created_at: string;
};

export default function MyPropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setProperties(data ?? []);
      setLoading(false);
    }

    loadProperties();
  }, [router]);

 async function handleDelete(property: Property) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this property? The property and its photos will be permanently deleted."
  );

  if (!confirmed) {
    return;
  }

  setErrorMessage("");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    setErrorMessage("You must be signed in.");
    return;
  }

  try {
    // 1. Convert public image URLs back into Storage file paths
    const imagePaths =
      property.image_urls
        ?.map((url) => {
          const marker =
            "/storage/v1/object/public/property-images/";

          const markerIndex = url.indexOf(marker);

          if (markerIndex === -1) {
            return null;
          }

          return url.substring(markerIndex + marker.length);
        })
        .filter((path): path is string => path !== null) ?? [];

    // 2. Delete images from Supabase Storage
    if (imagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("property-images")
        .remove(imagePaths);

      if (storageError) {
        throw storageError;
      }
    }

    // 3. Delete the property from the database
    const { error: deleteError } = await supabase
      .from("properties")
      .delete()
      .eq("id", property.id)
      .eq("owner_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    // 4. Remove the card from the screen
    setProperties((currentProperties) =>
      currentProperties.filter(
        (currentProperty) =>
          currentProperty.id !== property.id
      )
    );
  } catch (error) {
    console.error("Delete property error:", error);

    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage(
        "Something went wrong while deleting the property."
      );
    }
  }
}

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My properties
            </h1>

            <p className="mt-2 text-gray-600">
              Manage the properties you have submitted to FasoHome.
            </p>
          </div>

          <Link
            href="/list-property"
            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Add property
          </Link>
        </div>

        {loading && (
          <p className="mt-10 text-gray-600">
            Loading your properties...
          </p>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && properties.length === 0 && (
          <div className="mt-10 rounded-2xl border bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              You have not listed any properties yet.
            </h2>

            <p className="mt-2 text-gray-600">
              Add your first property to FasoHome.
            </p>

            <Link
              href="/list-property"
              className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white"
            >
              List a property
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <article
              key={property.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <div className="relative h-52">
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

                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold capitalize shadow">
                  {property.status}
                </span>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900">
                  {property.title}
                </h2>

                <p className="mt-2 text-gray-600">
                  {property.neighborhood}, {property.city}
                </p>

                <p className="mt-3 text-xl font-bold text-green-700">
                  {Number(property.price).toLocaleString()} FCFA
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3">
  <Link
    href={`/properties/${property.id}`}
    className="rounded-lg border border-green-700 px-4 py-3 text-center font-semibold text-green-700 hover:bg-green-50"
  >
    View
  </Link>

  <Link
    href={`/my-properties/${property.id}/edit`}
    className="rounded-lg bg-green-700 px-4 py-3 text-center font-semibold text-white hover:bg-green-800"
  >
    Edit
  </Link>

  <button
    type="button"
   onClick={() => handleDelete(property)}
    className="rounded-lg border border-red-600 px-4 py-3 font-semibold text-red-600 hover:bg-red-50"
  >
    Delete
  </button>
</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}