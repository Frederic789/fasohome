
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
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

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        await loadAccountType(currentUser.id);
      } else {
        setAccountType(null);
      }

      setLoading(false);
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

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    closeMenu();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setUser(null);
    setAccountType(null);

    router.push("/");
    router.refresh();
  }

  const listPropertyHref = user
    ? "/list-property"
    : "/login?redirect=/list-property";

  return (
    <header className="relative z-50 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="min-w-0 shrink-0"
          aria-label="FasoHome homepage"
        >
          <Image
            src="/images/fasohome-logo.png"
            alt="FasoHome"
            width={220}
            height={80}
            priority
            className="h-auto w-36 sm:w-44 lg:w-52"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
          <Link
            href="/search?type=sale"
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

          <Link
            href="/agencies"
            className="font-semibold text-gray-900 hover:text-green-700"
          >
            Agencies
          </Link>
        </nav>

        {/* Desktop account navigation */}
        <div className="hidden items-center gap-4 lg:flex">
          {!loading && (
            <Link
              href={listPropertyHref}
              className="whitespace-nowrap rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
            >
              List a property
            </Link>
          )}

          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap font-semibold text-gray-700 hover:text-green-700"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="whitespace-nowrap rounded-lg border border-green-700 px-4 py-3 font-semibold text-green-700 hover:bg-green-50"
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
                className="whitespace-nowrap font-semibold text-red-600 hover:text-red-700"
              >
                Log out
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="flex shrink-0 items-center justify-center rounded-lg border border-gray-200 p-3 text-gray-900 hover:bg-gray-50 lg:hidden"
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-gray-200 bg-white px-4 pb-6 pt-3 shadow-lg lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <Link
              href="/search?type=sale"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-semibold text-gray-900 hover:bg-green-50"
            >
              Buy
            </Link>

            <Link
              href="/search?type=rent"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-semibold text-gray-900 hover:bg-green-50"
            >
              Rent
            </Link>

            <Link
              href="/search?propertyType=land"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-semibold text-gray-900 hover:bg-green-50"
            >
              Land
            </Link>

            <Link
              href="/agencies"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-semibold text-gray-900 hover:bg-green-50"
            >
              Agencies
            </Link>

            {!loading && (
              <>
                <div className="my-2 border-t border-gray-200" />

                <Link
                  href={listPropertyHref}
                  onClick={closeMenu}
                  className="rounded-lg bg-green-700 px-4 py-3 text-center font-semibold text-white hover:bg-green-800"
                >
                  List a property
                </Link>

                {!user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="rounded-lg px-4 py-3 font-semibold text-gray-700 hover:bg-green-50"
                    >
                      Sign in
                    </Link>

                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className="rounded-lg px-4 py-3 font-semibold text-green-700 hover:bg-green-50"
                    >
                      Create account
                    </Link>
                  </>
                ) : (
                  <>
                    {accountType === "agency" && (
                      <Link
                        href="/agency/dashboard"
                        onClick={closeMenu}
                        className="rounded-lg px-4 py-3 font-semibold text-green-700 hover:bg-green-50"
                      >
                        Dashboard
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className="rounded-lg px-4 py-3 font-semibold text-gray-700 hover:bg-green-50"
                    >
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-lg px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
