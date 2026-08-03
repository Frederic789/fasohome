import Image from "next/image";
import Link from "next/link";
import { properties } from "./data/properties";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
    <a href="/" className="text-2xl font-bold text-green-700">
      FasoHome
    </a>

    <nav className="hidden items-center gap-7 text-sm font-semibold text-gray-700 lg:flex">
      <a href="#properties" className="hover:text-green-700">
        Buy
      </a>

      <a href="#properties" className="hover:text-green-700">
        Rent
      </a>

      <a href="#properties" className="hover:text-green-700">
        Land
      </a>

     
    </nav>

   <Link
  href="/list-property"
  className="rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
>
  List a property
</Link>
  </div>
</header>

      <section className="bg-green-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-yellow-400">
            Real estate in Burkina Faso
          </p>

          <h2 className="text-4xl font-bold md:text-6xl">
            Find a place you can trust
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-green-100">
            Search verified houses, apartments, land and commercial properties
            across Burkina Faso.
          </p>

          <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-xl bg-white p-2 shadow-xl md:flex-row">
            <select className="rounded-lg border px-4 py-4 text-gray-800">
              <option>Buy</option>
              <option>Rent</option>
              <option>Land</option>
            </select>

            <input
              type="search"
              placeholder="City, neighborhood, sector or landmark"
              className="flex-1 rounded-lg border px-4 py-4 text-gray-900 outline-none"
            />

            <button
              type="submit"
              className="rounded-lg bg-yellow-500 px-8 py-4 font-bold text-gray-950"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section
  id="properties"
  className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14"
>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured properties
          </h2>

          <p className="mt-2 text-gray-600">
            Explore recently added properties in Burkina Faso.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <article
              key={property.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
             <div className="relative h-56 w-full">
  <Image
    src={property.image}
    alt={property.title}
    fill
    className="object-cover"
  />
  

  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow">
    Featured
  </span>

  <button
    type="button"
    aria-label="Save property"
    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow"
  >
    ♡
  </button>
</div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {property.price}
                  </h3>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    {property.trustScore}% trusted
                  </span>
                </div>

                <p className="mt-3 font-semibold text-gray-800">
                  {property.title}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {property.details}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {property.location}
                </p>

         <Link
  href={`/properties/${property.id}`}
  className="mt-5 block w-full rounded-lg border border-green-700 px-4 py-3 text-center font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
>
  View property
</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section
  id="diaspora"
  className="bg-green-900 px-6 py-16 text-white"
>
  <div className="mx-auto max-w-7xl">
    <p className="font-semibold uppercase tracking-widest text-yellow-400">
      FasoHome Diaspora
    </p>

    <h2 className="mt-3 text-3xl font-bold md:text-4xl">
      Searching from outside Burkina Faso?
    </h2>

    <p className="mt-5 max-w-2xl leading-7 text-green-100">
      Request a property inspection, GPS verification, recorded video tour,
      or live video visit before making a decision.
    </p>

    <button className="mt-7 rounded-lg bg-yellow-500 px-6 py-3 font-bold text-gray-950 hover:bg-yellow-400">
      Request an inspection
    </button>
  </div>
</section>
    </main>
  );
}