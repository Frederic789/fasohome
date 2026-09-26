"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import Header from "../../components/Header";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  account_type: string;

  agency_name: string | null;
  agency_phone: string | null;
  agency_whatsapp: string | null;
  agency_address: string | null;
  agency_description: string | null;
  agency_logo_url: string | null;
  is_verified: boolean;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [accountType, setAccountType] = useState("buyer");
  const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string | null>(null); 

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
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

      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setProfile(data);

      if (data?.account_type) {
        setAccountType(data.account_type);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setErrorMessage("Please choose an image file.");
    event.target.value = "";
    return;
  }

  const maxSize = 2 * 1024 * 1024;

  if (file.size > maxSize) {
    setErrorMessage("Agency logo must be smaller than 2 MB.");
    event.target.value = "";
    return;
  }

  setErrorMessage("");
  setLogoFile(file);

  const previewUrl = URL.createObjectURL(file);
  setLogoPreview(previewUrl);
}

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const whatsappNumber = formData.get("whatsappNumber") as string;
    const selectedAccountType = formData.get("accountType") as string;

    const updateData: {
      full_name: string;
      phone_number: string;
      whatsapp_number: string | null;
      account_type: string;

      agency_name?: string | null;
      agency_phone?: string | null;
      agency_whatsapp?: string | null;
      agency_address?: string | null;
      agency_description?: string | null;
      agency_logo_url?: string | null;
    } = {
      full_name: fullName,
      phone_number: phoneNumber,
      whatsapp_number: whatsappNumber || null,
      account_type: selectedAccountType,
    };

    if (selectedAccountType === "agency") {
      updateData.agency_name =
        (formData.get("agencyName") as string) || null;

      updateData.agency_phone =
        (formData.get("agencyPhone") as string) || null;

      updateData.agency_whatsapp =
        (formData.get("agencyWhatsapp") as string) || null;

      updateData.agency_address =
        (formData.get("agencyAddress") as string) || null;

      updateData.agency_description =
        (formData.get("agencyDescription") as string) || null;
    }

    if (logoFile) {
  const fileExtension =
    logoFile.name.split(".").pop()?.toLowerCase() || "jpg";

  const filePath = `${user.id}/logo-${Date.now()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("agency-logos")
    .upload(filePath, logoFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    setErrorMessage(`Logo upload failed: ${uploadError.message}`);
    setSaving(false);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("agency-logos")
    .getPublicUrl(filePath);

  updateData.agency_logo_url = publicUrlData.publicUrl;
}

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSuccessMessage("Profile updated successfully.");
    setSaving(false);

    setTimeout(() => {
      router.push("/profile");
      router.refresh();
    }, 1000);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-gray-600">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit profile
              </h1>

              <p className="mt-2 text-gray-600">
                Update your FasoHome profile information.
              </p>
            </div>

            <Link
              href="/profile"
              className="font-semibold text-green-700 hover:underline"
            >
              Back
            </Link>
          </div>

          <form onSubmit={handleUpdate} className="mt-8 space-y-5">
            <label className="block">
              <span className="font-semibold text-gray-700">
                Full name
              </span>

              <input
                type="text"
                name="fullName"
                required
                defaultValue={profile?.full_name ?? ""}
                className={inputStyles}
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Email
              </span>

              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Phone number
              </span>

              <input
                type="tel"
                name="phoneNumber"
                required
                defaultValue={profile?.phone_number ?? ""}
                className={inputStyles}
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                WhatsApp number
              </span>

              <input
                type="tel"
                name="whatsappNumber"
                defaultValue={profile?.whatsapp_number ?? ""}
                className={inputStyles}
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Account type
              </span>

              <select
                name="accountType"
                required
                value={accountType}
                onChange={(event) =>
                  setAccountType(event.target.value)
                }
                className={inputStyles}
              >
                <option value="buyer">
                  Buyer
                </option>

                <option value="owner">
                  Property owner
                </option>

                <option value="agency">
                  Real estate agency
                </option>
              </select>
            </label>

            {accountType === "agency" && (
              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Agency information
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Information about your real estate agency.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="rounded-xl border border-green-200 bg-white p-5">
  <p className="font-semibold text-gray-700">
    Agency logo
  </p>

  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
    {(logoPreview || profile?.agency_logo_url) ? (
      <img
        src={logoPreview || profile?.agency_logo_url || ""}
        alt="Agency logo"
        className="h-24 w-24 rounded-xl border border-gray-200 object-contain p-2"
      />
    ) : (
      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-500">
        No logo
      </div>
    )}

    <div className="flex-1">
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleLogoChange}
        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-green-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-green-800"
      />

      <p className="mt-2 text-xs text-gray-500">
        PNG, JPG or WebP. Maximum size: 2 MB.
      </p>
    </div>
  </div>
</div>
                  <label className="block">
                    <span className="font-semibold text-gray-700">
                      Agency name
                    </span>

                    <input
                      type="text"
                      name="agencyName"
                      required
                      defaultValue={profile?.agency_name ?? ""}
                      placeholder="Example: FasoHome Realty"
                      className={inputStyles}
                    />
                  </label>

                  <label className="block">
                    <span className="font-semibold text-gray-700">
                      Agency phone
                    </span>

                    <input
                      type="tel"
                      name="agencyPhone"
                      defaultValue={profile?.agency_phone ?? ""}
                      placeholder="+226 70 00 00 00"
                      className={inputStyles}
                    />
                  </label>

                  <label className="block">
                    <span className="font-semibold text-gray-700">
                      Agency WhatsApp
                    </span>

                    <input
                      type="tel"
                      name="agencyWhatsapp"
                      defaultValue={profile?.agency_whatsapp ?? ""}
                      placeholder="+226 70 00 00 00"
                      className={inputStyles}
                    />
                  </label>

                  <label className="block">
                    <span className="font-semibold text-gray-700">
                      Agency address
                    </span>

                    <input
                      type="text"
                      name="agencyAddress"
                      defaultValue={profile?.agency_address ?? ""}
                      placeholder="Example: Ouagadougou, Burkina Faso"
                      className={inputStyles}
                    />
                  </label>

                  <label className="block">
                    <span className="font-semibold text-gray-700">
                      Agency description
                    </span>

                    <textarea
                      name="agencyDescription"
                      rows={5}
                      defaultValue={profile?.agency_description ?? ""}
                      placeholder="Tell customers about your agency..."
                      className={inputStyles}
                    />
                  </label>

                  <div className="rounded-lg bg-white p-4">
                    <p className="text-sm font-semibold text-gray-700">
                      Verification status
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {profile?.is_verified
                        ? "✓ Verified agency"
                        : "Not verified yet"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
              <Link
                href="/profile"
                className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
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

const inputStyles =
  "mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100";