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
};

export default function EditProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

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
      setLoading(false);
    }

    loadProfile();
  }, [router]);

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
    const accountType = formData.get("accountType") as string;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        whatsapp_number: whatsappNumber || null,
        account_type: accountType,
      })
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
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
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

              <p className="mt-2 text-xs text-gray-500">
                Email editing will be added separately.
              </p>
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
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
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
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Account type
              </span>

              <select
                name="accountType"
                required
                defaultValue={profile?.account_type ?? "buyer"}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              >
                <option value="buyer">
                  Buyer
                </option>

                <option value="owner">
                  Property owner
                </option>

                <option value="agent">
                  Real estate agent
                </option>
              </select>
            </label>

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