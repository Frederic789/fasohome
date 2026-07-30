const properties = [
  {
    id: 1,
    title: "Modern villa in Ouaga 2000",
    location: "Ouaga 2000, Ouagadougou",
    price: "45,000,000 FCFA",
    details: "3 bedrooms • 2 bathrooms • 350 m²",
    trustScore: 92,
  },
  {
    id: 2,
    title: "Apartment for rent in Karpala",
    location: "Karpala, Ouagadougou",
    price: "175,000 FCFA/month",
    details: "2 bedrooms • 1 bathroom • 95 m²",
    trustScore: 78,
  },
  {
    id: 3,
    title: "Residential land in Balkuy",
    location: "Balkuy, Ouagadougou",
    price: "12,500,000 FCFA",
    details: "300 m² • Accessible road",
    trustScore: 85,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-green-700">FasoHome</h1>

          <nav className="hidden gap-6 text-sm font-medium text-gray-700 md:flex">
            <a href="#">Buy</a>
            <a href="#">Rent</a>
            <a href="#">Land</a>
            <a href="#">Professionals</a>
          </nav>

          <button className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white">
            List a property
          </button>
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

          <form className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-xl bg-white p-2 shadow-xl md:flex-row">
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
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
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
              <div className="flex h-56 items-center justify-center bg-gray-200 text-gray-500">
                Property image
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

                <button className="mt-5 w-full rounded-lg border border-green-700 px-4 py-3 font-semibold text-green-700">
                  View property
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}