"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Profile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  account_type: string;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setErrorMessage(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="mx-auto max-w-4xl px-6 py-16">
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

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.full_name || "FasoHome User"}
              </h1>

              <p className="mt-1 text-gray-600">
                {user?.email}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <ProfileItem
              label="Full name"
              value={profile?.full_name}
            />

            <ProfileItem
              label="Email"
              value={user?.email}
            />

            <ProfileItem
              label="Phone number"
              value={profile?.phone_number}
            />

            <ProfileItem
              label="WhatsApp number"
              value={profile?.whatsapp_number}
            />

            <ProfileItem
              label="Account type"
              value={profile?.account_type}
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
  href="/profile/edit"
  className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
>
  Edit profile
</Link>

<Link
  href="/my-properties"
  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
>
  My properties
</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

type ProfileItemProps = {
  label: string;
  value?: string | null;
};

function ProfileItem({
  label,
  value,
}: ProfileItemProps) {
  return (
    <div className="rounded-xl border bg-gray-50 p-5">
      <p className="text-sm font-semibold text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold capitalize text-gray-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}