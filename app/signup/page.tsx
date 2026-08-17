"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const whatsappNumber = formData.get("whatsappNumber") as string;
    const accountType = formData.get("accountType") as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          whatsapp_number: whatsappNumber,
          account_type: accountType,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Account created successfully. Please check your email to confirm your account."
    );

    form.reset();
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Create your FasoHome account
          </h1>

          <p className="mt-3 text-gray-600">
            Create an account to list properties, save homes, and manage your
            profile.
          </p>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <label className="block">
              <span className="font-semibold text-gray-700">
                Full name
              </span>

              <input
                type="text"
                name="fullName"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Email
              </span>

              <input
                type="email"
                name="email"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Password
              </span>

              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
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
                placeholder="+226 70 00 00 00"
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
                placeholder="+226 70 00 00 00"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Account type
              </span>

              <select
                name="accountType"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
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

            {message && (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}