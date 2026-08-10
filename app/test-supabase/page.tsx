"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function TestSupabasePage() {
  const [message, setMessage] = useState(
    "Click the button to test the connection."
  );

  async function testConnection() {
    setMessage("Testing connection...");

    const { error } = await supabase
      .from("properties")
      .select("id")
      .limit(1);

    if (error) {
      setMessage(`Connection error: ${error.message}`);
      return;
    }

    setMessage("Supabase connection is working!");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-green-700">
          FasoHome Supabase Test
        </h1>

        <p className="mt-4 text-gray-600">
          {message}
        </p>

        <button
          type="button"
          onClick={testConnection}
          className="mt-6 rounded-lg bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"
        >
          Test connection
        </button>
      </div>
    </main>
  );
}