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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);

    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/fasohome-logo.png"
            alt="FasoHome"
            width={220}
            height={80}
            priority
            className="object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-gray-700 lg:flex">
          <Link href="/#properties" className="hover:text-green-700">
            Buy
          </Link>

          <Link href="/#properties" className="hover:text-green-700">
            Rent
          </Link>

          <Link href="/#properties" className="hover:text-green-700">
            Land
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/list-property"
            className="rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
          >
            List a property
          </Link>

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