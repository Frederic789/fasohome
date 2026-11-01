
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";

type BuyerInquiry = {
  id: number;
  property_id: number;
  status: string;
  created_at: string;
  preferred_visit_date: string | null;
  message: string | null;
};

type PropertySummary = {
  id: number;
  title: string;
};

export default function BuyerDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [inquiries, setInquiries] = useState<BuyerInquiry[]>([]);
  const [propertyTitles, setPropertyTitles] = useState<Record<number, string>>({});
const [inquiriesError, setInquiriesError] = useState("");

  useEffect(() => {
    async function loadBuyer() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login?redirect=/dashboard");
        return;
      }

      setBuyerEmail(data.user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .maybeSingle();

      setBuyerName(profile?.full_name || "Buyer");

const { data: inquiryData, error: inquiryError } = await supabase
  .from("property_inquiries")
  .select(
    "id, property_id, status, created_at, preferred_visit_date, message"
  )
  .eq("user_id", data.user.id)
  .order("created_at", { ascending: false });

if (inquiryError) {
  console.error("Error loading buyer inquiries:", inquiryError);
  setInquiriesError("Unable to load your inquiries.");

} else {
  const buyerInquiries = (inquiryData ?? []) as BuyerInquiry[];
  setInquiries(buyerInquiries);

  const propertyIds = [
    ...new Set(buyerInquiries.map((inquiry) => inquiry.property_id)),
  ];

  if (propertyIds.length > 0) {
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, title")
      .in("id", propertyIds);

    if (propertiesError) {
      console.error("Error loading property titles:", propertiesError);
    } else {
      const titles: Record<number, string> = {};

      ((properties ?? []) as PropertySummary[]).forEach((property) => {
        titles[property.id] = property.title;
      });

      setPropertyTitles(titles);
    }
  }
}


setLoading(false);
    }

    loadBuyer();
  }, [router]);

  const totalInquiries = inquiries.length;

const pendingInquiries = inquiries.filter(
  (inquiry) => inquiry.status === "new"
).length;

const completedInquiries = inquiries.filter(
  (inquiry) => inquiry.status === "completed"
).length;

const inProgressInquiries = inquiries.filter(
  (inquiry) =>
    inquiry.status === "contacted" ||
    inquiry.status === "negotiating"
).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <p className="p-10 text-center text-gray-900">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900">
          My Buyer Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome back, {buyerName}!
        </p>

       <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              My Inquiries
            </p>
           <p className="mt-3 text-3xl font-bold text-green-700">
  {totalInquiries}
</p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Requests
            </p>
           <p className="mt-3 text-3xl font-bold text-amber-600">
  {pendingInquiries}
</p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
  <p className="text-sm text-gray-500">
    In Progress
  </p>
  <p className="mt-3 text-3xl font-bold text-purple-700">
    {inProgressInquiries}
  </p>
</div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Completed Requests
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-700">
  {completedInquiries}
</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            My Property Inquiries
          </h2>

         
{inquiriesError ? (
  <p role="alert" className="mt-4 text-red-600">
    {inquiriesError}
  </p>
) : inquiries.length === 0 ? (
  <p className="mt-4 text-gray-600">
    You haven't submitted any property inquiries yet.
  </p>
) : (
  <div className="mt-5 space-y-4">
    {inquiries.map((inquiry) => (
      <div
        key={inquiry.id}
        className="rounded-xl border border-gray-200 bg-gray-50 p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
         <h3 className="font-bold text-gray-900">
  {propertyTitles[inquiry.property_id] ||
    `Property #${inquiry.property_id}`}
</h3>

          
<span
  className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
    inquiry.status === "new"
      ? "bg-amber-100 text-amber-800"
      : inquiry.status === "contacted"
      ? "bg-blue-100 text-blue-800"
      : inquiry.status === "negotiating"
      ? "bg-purple-100 text-purple-800"
      : inquiry.status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-700"
  }`}
>
  {inquiry.status}
</span>

        </div>

        <p className="mt-2 text-sm text-gray-600">
          Submitted:{" "}
          {new Date(inquiry.created_at).toLocaleDateString()}
        </p>

        {inquiry.preferred_visit_date && (
          <p className="mt-2 text-sm text-gray-600">
            Preferred visit: {inquiry.preferred_visit_date}
          </p>
        )}

        {inquiry.message && (
          <p className="mt-3 text-gray-700">
            {inquiry.message}
          </p>
        )}

        <Link
          href={`/properties/${inquiry.property_id}`}
          className="mt-4 inline-block font-semibold text-green-700 hover:underline"
        >
          View Property →
        </Link>
      </div>
    ))}
  </div>
)}


          <Link
            href="/#properties"
            className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Browse Properties
          </Link>
        </div>

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            My Account
          </h2>

          <p className="mt-3 text-gray-700">
            Email: {buyerEmail}
          </p>

          <Link
            href="/profile"
            className="mt-4 inline-block font-semibold text-green-700 hover:underline"
          >
            Manage My Profile →
          </Link>
        </div>
      </section>
    </main>
  );
}
