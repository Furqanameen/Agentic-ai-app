export type SparePart = {
  id: number;
  brand: string;
  model: string;
  year: number;
  partName: string;
  supplier: string;
  price: number;
  currency: string;
};

const spareParts: SparePart[] = [
  {
    id: 1,
    brand: "Toyota",
    model: "Camry",
    year: 2018,
    partName: "Front Brake Pads",
    supplier: "Supplier A",
    price: 45,
    currency: "USD",
  },
  {
    id: 2,
    brand: "Toyota",
    model: "Camry",
    year: 2018,
    partName: "Front Brake Pads",
    supplier: "Supplier B",
    price: 38,
    currency: "USD",
  },
  {
    id: 3,
    brand: "Toyota",
    model: "Camry",
    year: 2018,
    partName: "Front Brake Pads",
    supplier: "Supplier C",
    price: 52,
    currency: "USD",
  },
  {
    id: 4,
    brand: "Toyota",
    model: "Corolla",
    year: 2019,
    partName: "Front Brake Pads",
    supplier: "Supplier A",
    price: 35,
    currency: "USD",
  },
];

export function searchSpareParts({
  brand,
  model,
  year,
  partName,
}: {
  brand?: string;
  model?: string;
  year?: number;
  partName?: string;
}) {
  return spareParts.filter((part) => {
    const matchesBrand =
      !brand ||
      part.brand.toLowerCase() === brand.toLowerCase();

    const matchesModel =
      !model ||
      part.model.toLowerCase() === model.toLowerCase();

    const matchesYear =
      !year || part.year === year;

    const matchesPart =
      !partName ||
      part.partName
        .toLowerCase()
        .includes(partName.toLowerCase());

    return (
      matchesBrand &&
      matchesModel &&
      matchesYear &&
      matchesPart
    );
  });
}

export const sparePartsToolDescription = {
  name: "searchSpareParts",

  description:
    "Search supplier spare-part prices using car brand, model, year and spare-part name.",

  parameters: {
    brand: "string",
    model: "string",
    year: "number",
    partName: "string",
  },
};