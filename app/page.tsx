import SparePartsSearch from "@/components/spare-parts/SparePartsSearch";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Supplier Price Search
          </h1>

          <p className="mt-2 text-gray-600">
            Find spare part prices from your supplier database.
          </p>
        </div>

        <SparePartsSearch />
      </div>
    </main>
  );
}