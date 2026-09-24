"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleUpdatePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get(
      "confirmPassword"
    ) as string;

    if (password.length < 8) {
      setErrorMessage(
        "Your password must contain at least 8 characters."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage("Your password has been changed successfully.");

    setLoading(false);

    setTimeout(() => {
      router.push("/profile");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-lg px-6 py-14">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Create a new password
          </h1>

          <p className="mt-3 text-gray-600">
            Enter a new password for your FasoHome account.
          </p>

          <form
            onSubmit={handleUpdatePassword}
            className="mt-8 space-y-5"
          >
            <label className="block">
              <span className="font-semibold text-gray-700">
                New password
              </span>

              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />
            </label>

            <label className="block">
              <span className="font-semibold text-gray-700">
                Confirm new password
              </span>

              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                autoComplete="new-password"
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
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}