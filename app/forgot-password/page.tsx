"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage(
      "Password reset email sent. Check your inbox and follow the link."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-lg px-6 py-14">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Reset your password
          </h1>

          <p className="mt-3 text-gray-600">
            Enter the email address associated with your FasoHome account.
          </p>

          <form onSubmit={handleReset} className="mt-8 space-y-5">
            <label className="block">
              <span className="font-semibold text-gray-700">
                Email address
              </span>

              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-700 px-6 py-4 font-bold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="font-semibold text-green-700 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}