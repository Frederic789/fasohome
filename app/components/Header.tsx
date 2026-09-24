"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

export default function Header() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        await loadAccountType(user.id);
      } else {
        setAccountType(null);
      }

      setLoading(false);
    }

    async function loadAccountType(userId: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading account type:", error);
        setAccountType(null);
        return;
      }

      setAccountType(data?.account_type ?? null);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        loadAccountType(currentUser.id);
      } else {
        setAccountType(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);
    setAccountType(null);

    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/fasohome-logo.png"
            alt="FasoHome"
            width={220}
            height={80}
            priority
            style={{
              width: "220px",
              height: "auto",
            }}
          />
        </Link>

        {/* Main navigation */}
        <nav className="flex items-center gap-8">
          <Link
            href="/search?type=buy"
            className="font-semibold text-gray-900 hover:text-green-700"
          >
            Buy
          </Link>

          <Link
            href="/search?type=rent"
            className="font-semibold text-gray-900 hover:text-green-700"
          >
            Rent
          </Link>

          <Link
            href="/search?propertyType=land"
            className="font-semibold text-gray-900 hover:text-green-700"
          >
            Land
          </Link>
        </nav>

        {/* Account navigation */}
        <div className="flex items-center gap-5">
        {!loading && (
  <Link
    href={user ? "/list-property" : "/login?redirect=/list-property"}
    className="rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
  >
    List a property
  </Link>
)}

          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="font-semibold text-gray-700 hover:text-green-700"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="rounded-lg border border-green-700 px-4 py-3 font-semibold text-green-700 hover:bg-green-50"
              >
                Create account
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              {accountType === "agency" && (
                <Link
                  href="/agency/dashboard"
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  Dashboard
                </Link>
              )}

              <Link
                href="/profile"
                className="font-semibold text-gray-700 hover:text-green-700"
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="font-semibold text-red-600 hover:text-red-700"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}