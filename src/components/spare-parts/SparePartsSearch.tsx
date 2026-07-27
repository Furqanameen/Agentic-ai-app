"use client";

import { FormEvent, useState } from "react";

type SearchResult = {
  id: number;

  car: {
    brand: string;
    model: string;
    year: number;
    variant: string | null;
  };

  sparePart: {
    name: string;
    partNumber: string | null;
    category: string | null;
  };

  supplier: {
    name: string;
    contactName: string | null;
    phone: string | null;
    email: string | null;
  };

  price: string;
  currency: string;
  available: boolean;
};

export default function SparePartsSearch() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [partName, setPartName] = useState("");

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (brand.trim()) {
        params.set("brand", brand.trim());
      }

      if (model.trim()) {
        params.set("model", model.trim());
      }

      if (year.trim()) {
        params.set("year", year.trim());
      }

      if (partName.trim()) {
        params.set("partName", partName.trim());
      }

      const response = await fetch(
        `/api/spare-parts/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to search spare parts");
      }

      const data = await response.json();

      setResults(data.results);
    } catch (error) {
      console.error(error);
      setError("Something went wrong while searching.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setBrand("");
    setModel("");
    setYear("");
    setPartName("");
    setResults([]);
    setError("");
  }

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Car Brand
            </label>

            <input
              type="text"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Toyota"
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Car Model
            </label>

            <input
              type="text"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Camry"
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Year
            </label>

            <input
              type="number"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              placeholder="2020"
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Spare Part
            </label>

            <input
              type="text"
              value={partName}
              onChange={(event) => setPartName(event.target.value)}
              placeholder="Brake Pads"
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-6 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Spare Parts"}
          </button>

          <button
            type="button"
            onClick={clearSearch}
            className="rounded-lg border px-6 py-2"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Supplier Prices
        </h2>

        {results.length === 0 && !loading && !error && (
          <div className="rounded-xl border bg-gray-50 p-8 text-center text-gray-500">
            Search for a spare part to see supplier prices.
          </div>
        )}

        <div className="grid gap-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h3 className="text-lg font-semibold">
                    {result.sparePart.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {result.sparePart.partNumber || "No part number"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {result.currency} {result.price}
                  </p>

                  <p
                    className={
                      result.available
                        ? "text-sm text-green-600"
                        : "text-sm text-red-600"
                    }
                  >
                    {result.available
                      ? "Available"
                      : "Unavailable"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t pt-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Vehicle
                  </p>

                  <p className="font-medium">
                    {result.car.brand} {result.car.model}
                  </p>

                  <p className="text-sm text-gray-600">
                    {result.car.year}
                    {result.car.variant
                      ? ` • ${result.car.variant}`
                      : ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Supplier
                  </p>

                  <p className="font-medium">
                    {result.supplier.name}
                  </p>

                  {result.supplier.contactName && (
                    <p className="text-sm text-gray-600">
                      {result.supplier.contactName}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Contact
                  </p>

                  {result.supplier.phone && (
                    <p className="text-sm">
                      {result.supplier.phone}
                    </p>
                  )}

                  {result.supplier.email && (
                    <p className="text-sm">
                      {result.supplier.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}