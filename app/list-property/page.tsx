"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ListPropertyPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Property submitted
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            Thank you. Your property information has been received for review.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            This is currently a test form. We will connect it to a database
            later.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="rounded-lg bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"
            >
              Submit another property
            </button>

            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50"
            >
              Return home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-green-700">
            FasoHome
          </Link>

          <Link
            href="/"
            className="font-semibold text-gray-700 hover:text-green-700"
          >
            Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <p className="font-semibold uppercase tracking-widest text-green-700">
            Property submission
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            List your property
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-gray-600">
            Provide accurate information to help buyers and renters understand
            your property.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm md:p-10"
        >
          <FormSection
            number="1"
            title="Basic information"
            description="Tell us what kind of property you are listing."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Property title">
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Example: Modern villa in Ouaga 2000"
                  className={inputStyles}
                />
              </FormField>

              <FormField label="Listing type">
                <select name="transactionType" required className={inputStyles}>
                  <option value="">Select an option</option>
                  <option value="sale">For sale</option>
                  <option value="rent">For rent</option>
                </select>
              </FormField>

              <FormField label="Property type">
                <select name="propertyType" required className={inputStyles}>
                  <option value="">Select a property type</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="studio">Studio</option>
                  <option value="duplex">Duplex</option>
                  <option value="house">House</option>
                  <option value="land">Land</option>
                  <option value="shop">Shop</option>
                  <option value="office">Office</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </FormField>

              <FormField label="Price in FCFA">
                <input
                  type="number"
                  name="price"
                  min="0"
                  required
                  placeholder="Example: 45000000"
                  className={inputStyles}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            number="2"
            title="Location"
            description="Use the city, neighborhood, sector, and nearest landmark."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="City">
                <select name="city" required className={inputStyles}>
                  <option value="">Select a city</option>
                  <option value="Ouagadougou">Ouagadougou</option>
                  <option value="Bobo-Dioulasso">Bobo-Dioulasso</option>
                  <option value="Koudougou">Koudougou</option>
                  <option value="Banfora">Banfora</option>
                  <option value="Ouahigouya">Ouahigouya</option>
                  <option value="Kaya">Kaya</option>
                  <option value="other">Other city</option>
                </select>
              </FormField>

              <FormField label="Neighborhood">
                <input
                  type="text"
                  name="neighborhood"
                  required
                  placeholder="Example: Karpala"
                  className={inputStyles}
                />
              </FormField>

              <FormField label="Sector">
                <input
                  type="text"
                  name="sector"
                  placeholder="Example: Sector 51"
                  className={inputStyles}
                />
              </FormField>

              <FormField label="Nearest landmark">
                <input
                  type="text"
                  name="landmark"
                  placeholder="Example: Near SIAO"
                  className={inputStyles}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            number="3"
            title="Property details"
            description="Add the property's size and main characteristics."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Bedrooms">
                <input
                  type="number"
                  name="bedrooms"
                  min="0"
                  defaultValue="0"
                  className={inputStyles}
                />
              </FormField>

              <FormField label="Bathrooms">
                <input
                  type="number"
                  name="bathrooms"
                  min="0"
                  defaultValue="0"
                  className={inputStyles}
                />
              </FormField>

              <FormField label="Area in m²">
                <input
                  type="number"
                  name="area"
                  min="0"
                  required
                  placeholder="Example: 350"
                  className={inputStyles}
                />
              </FormField>
            </div>

            <FormField label="Property description">
              <textarea
                name="description"
                required
                rows={6}
                placeholder="Describe the property, road access, condition, rooms, courtyard, security, and other important information."
                className={inputStyles}
              />
            </FormField>
          </FormSection>

          <FormSection
            number="4"
            title="Features"
            description="Select the services and features available at the property."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <CheckboxField name="hasWater" label="Running water" />
              <CheckboxField name="hasElectricity" label="Electricity" />
              <CheckboxField name="hasSolar" label="Solar installation" />
              <CheckboxField name="hasParking" label="Parking" />
              <CheckboxField name="hasFence" label="Walled or fenced property" />
              <CheckboxField
                name="pavedRoadAccess"
                label="Paved-road access"
              />
            </div>
          </FormSection>

          <FormSection
            number="5"
            title="Pictures and contact"
            description="Add property pictures and advertiser contact information."
          >
            <FormField label="Property pictures">
              <input
                type="file"
                name="images"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="block w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-green-700 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-green-800"
              />

              <p className="mt-2 text-sm text-gray-500">
                You may select multiple JPG, PNG, or WebP images.
              </p>
            </FormField>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Telephone number">
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  placeholder="+226 70 00 00 00"
                  className={inputStyles}
                />
              </FormField>

              <FormField label="WhatsApp number">
                <input
                  type="tel"
                  name="whatsappNumber"
                  placeholder="+226 70 00 00 00"
                  className={inputStyles}
                />
              </FormField>
            </div>
          </FormSection>

          <div className="mt-10 rounded-xl bg-yellow-50 p-5 text-sm leading-6 text-yellow-900">
            By submitting this property, you confirm that the information and
            pictures are accurate and that you have permission to advertise the
            property.
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-6 py-4 text-center font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-green-700 px-8 py-4 font-bold text-white hover:bg-green-800"
            >
              Submit property
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

const inputStyles =
  "mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100";

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="block font-semibold text-gray-700">
      {label}
      {children}
    </label>
  );
}

type FormSectionProps = {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function FormSection({
  number,
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="border-b border-gray-200 py-8 first:pt-0 last:border-b-0">
      <div className="mb-6 flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
          {number}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </section>
  );
}

type CheckboxFieldProps = {
  name: string;
  label: string;
};

function CheckboxField({ name, label }: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 font-medium text-gray-700 hover:border-green-600">
      <input
        type="checkbox"
        name={name}
        className="h-5 w-5 accent-green-700"
      />

      {label}
    </label>
  );
}