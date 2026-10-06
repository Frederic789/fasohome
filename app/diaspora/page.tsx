import Link from "next/link";
import Header from "../components/Header";

export default function DiasporaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-green-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="font-semibold uppercase tracking-widest text-yellow-400">
            FasoHome Diaspora
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-5xl">
            Invest in Burkina Faso with greater confidence, wherever you live.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            FasoHome Diaspora helps people living abroad obtain local
            information about properties and projects before making important
            decisions.
          </p>

          <a
            href="#services"
            className="mt-8 inline-block rounded-lg bg-yellow-500 px-6 py-3 font-bold text-gray-950 transition hover:bg-yellow-400"
          >
            Explore our services
          </a>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-semibold uppercase tracking-widest text-green-700">
              Diaspora Services
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Get local assistance before you make a decision
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Choose the type of assistance you need and FasoHome can help
              coordinate the request locally.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="Property Inspection"
              description="Request an in-person visit to inspect the general condition of a property."
            />

            <ServiceCard
              title="GPS & Location Verification"
              description="Request GPS coordinates and local information to help confirm where a property is located."
            />

            <ServiceCard
              title="Photo & Video Report"
              description="Receive current photos and a recorded video showing the property and its surroundings."
            />

            <ServiceCard
              title="Live Video Visit"
              description="Arrange a live video call from the property so you can see it remotely and ask questions."
            />

            <ServiceCard
              title="Document Verification Assistance"
              description="Request assistance reviewing available property documents and identifying when professional verification may be needed."
            />

            <ServiceCard
              title="Project Monitoring"
              description="Request periodic photo and video updates for a construction or property project in Burkina Faso."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900">
            How FasoHome Diaspora works
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Step
              number="1"
              title="Submit your request"
              description="Tell us about the property, location and service you need."
            />

            <Step
              number="2"
              title="We review the request"
              description="FasoHome reviews the information and confirms the next steps with you."
            />

            <Step
              number="3"
              title="Receive your report"
              description="Depending on the service, receive photos, videos, location information or other requested updates."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-900 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold">
            Need someone on the ground in Burkina Faso?
          </h2>

          <p className="mt-4 text-green-100">
            Submit a Diaspora service request and tell us how FasoHome can
            assist you.
          </p>

          <Link
            href="/diaspora/request"
            className="mt-8 inline-block rounded-lg bg-yellow-500 px-7 py-3 font-bold text-gray-950 transition hover:bg-yellow-400"
          >
            Request a service
          </Link>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-800">
        ✓
      </div>

      <h3 className="text-xl font-bold text-gray-900">{title}</h3>

      <p className="mt-3 leading-7 text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-lg font-bold text-white">
        {number}
      </div>

      <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>

      <p className="mt-2 leading-7 text-gray-600">{description}</p>
    </div>
  );
}