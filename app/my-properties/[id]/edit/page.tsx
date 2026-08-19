"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "../../../components/Header";
import { supabase } from "../../../lib/supabase";

type Property = {
  id: number;
  owner_id: string;
  title: string;
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
  status: string;
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();

  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setErrorMessage("");

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
        .eq("id", propertyId)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Property not found or you do not own this property.");
        setLoading(false);
        return;
      }

      setProperty(data);
      setLoading(false);
    }

    loadProperty();
  }, [propertyId, router]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  // Capture the form immediately
  const form = event.currentTarget;
  const formData = new FormData(form);

  if (!property) return;

  setSaving(true);
  setErrorMessage("");
  setSuccessMessage("");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    setErrorMessage("You must be signed in.");
    setSaving(false);
    return;
  }

  const updatedProperty = {
    title: formData.get("title") as string,
    transaction_type: formData.get("transactionType") as string,
    property_type: formData.get("propertyType") as string,
    price: Number(formData.get("price")),

    city: formData.get("city") as string,
    neighborhood: formData.get("neighborhood") as string,
    sector: (formData.get("sector") as string) || null,
    landmark: (formData.get("landmark") as string) || null,

    bedrooms: Number(formData.get("bedrooms") || 0),
    bathrooms: Number(formData.get("bathrooms") || 0),
    area: Number(formData.get("area")),

    description: formData.get("description") as string,

    has_water: formData.get("hasWater") === "on",
    has_electricity: formData.get("hasElectricity") === "on",
    has_solar: formData.get("hasSolar") === "on",
    has_parking: formData.get("hasParking") === "on",
    has_fence: formData.get("hasFence") === "on",
    paved_road_access:
      formData.get("pavedRoadAccess") === "on",

    phone_number: formData.get("phoneNumber") as string,
    whatsapp_number:
      (formData.get("whatsappNumber") as string) || null,

    status: "pending",
  };

  const { error } = await supabase
    .from("properties")
    .update(updatedProperty)
    .eq("id", property.id)
    .eq("owner_id", user.id);

  if (error) {
    setErrorMessage(error.message);
    setSaving(false);
    return;
  }

  setSuccessMessage(
    "Property updated successfully and sent back for review."
  );

  setSaving(false);

  setTimeout(() => {
    router.push("/my-properties");
    router.refresh();
  }, 1200);
}

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-gray-600">
            Loading property...
          </p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-red-700">
            {errorMessage || "Property not found."}
          </p>
        </div>
      </main>
    );


    
  }

  

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit property
          </h1>

          <p className="mt-2 text-gray-600">
            Update your listing information.
          </p>

          <form onSubmit={handleUpdate} className="mt-8 space-y-5">
            <label className="block">
              <span className="font-semibold text-gray-700">
                Title
              </span>

              <input
                type="text"
                name="title"
                required
                defaultValue={property.title}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="font-semibold text-gray-700">
                  Transaction type
                </span>

                <select
                  name="transactionType"
                  defaultValue={property.transaction_type}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </label>

              <label className="block">
                <span className="font-semibold text-gray-700">
                  Property type
                </span>

                <select
                  name="propertyType"
                  defaultValue={property.property_type}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="villa">Villa</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Price
              </span>

              <input
                type="number"
                name="price"
                required
                defaultValue={property.price}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="font-semibold text-gray-700">
                  City
                </span>

                <input
                  type="text"
                  name="city"
                  required
                  defaultValue={property.city}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-gray-700">
                  Neighborhood
                </span>

                <input
                  type="text"
                  name="neighborhood"
                  required
                  defaultValue={property.neighborhood}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="font-semibold text-gray-700">
                  Sector
                </span>

                <input
                  type="text"
                  name="sector"
                  defaultValue={property.sector ?? ""}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-gray-700">
                  Landmark
                </span>

                <input
                  type="text"
                  name="landmark"
                  defaultValue={property.landmark ?? ""}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="block">
                <span className="font-semibold text-gray-700">
                  Bedrooms
                </span>

                <input
                  type="number"
                  name="bedrooms"
                  defaultValue={property.bedrooms}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-gray-700">
                  Bathrooms
                </span>

                <input
                  type="number"
                  name="bathrooms"
                  defaultValue={property.bathrooms}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-gray-700">
                  Area (m²)
                </span>

                <input
                  type="number"
                  name="area"
                  defaultValue={property.area}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </label>
            </div>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Description
              </span>

              <textarea
                name="description"
                rows={5}
                defaultValue={property.description}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>

            <div>
              <p className="font-semibold text-gray-700">
                Amenities
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label>
                  <input
                    type="checkbox"
                    name="hasWater"
                    defaultChecked={property.has_water}
                  />{" "}
                  Running water
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="hasElectricity"
                    defaultChecked={property.has_electricity}
                  />{" "}
                  Electricity
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="hasSolar"
                    defaultChecked={property.has_solar}
                  />{" "}
                  Solar
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="hasParking"
                    defaultChecked={property.has_parking}
                  />{" "}
                  Parking
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="hasFence"
                    defaultChecked={property.has_fence}
                  />{" "}
                  Fence
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="pavedRoadAccess"
                    defaultChecked={property.paved_road_access}
                  />{" "}
                  Paved road access
                </label>
              </div>
            </div>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Phone number
              </span>

              <input
                type="tel"
                name="phoneNumber"
                required
                defaultValue={property.phone_number}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                WhatsApp number
              </span>

              <input
                type="tel"
                name="whatsappNumber"
                defaultValue={property.whatsapp_number ?? ""}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>

            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg bg-green-50 p-4 text-green-700">
                {successMessage}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/my-properties")}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}