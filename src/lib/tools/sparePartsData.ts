export type SparePart = {
  id: number;
  brand: string;
  model: string;
  year: number;
  partName: string;
  partNumber: string;
  supplier: string;
  price: number;
  currency: string;
};

export const spareParts: SparePart[] = [
  {
    id: 1,
    brand: "Toyota",
    model: "Camry",
    year: 2020,
    partName: "Front Brake Pads",
    partNumber: "BP-TOY-CAM-2020-F",
    supplier: "Supplier A",
    price: 45,
    currency: "USD",
  },
  {
    id: 2,
    brand: "Toyota",
    model: "Camry",
    year: 2020,
    partName: "Front Brake Pads",
    partNumber: "BP-TOY-CAM-2020-F",
    supplier: "Supplier B",
    price: 52,
    currency: "USD",
  },
  {
    id: 3,
    brand: "Toyota",
    model: "Camry",
    year: 2020,
    partName: "Oil Filter",
    partNumber: "OF-TOY-CAM-2020",
    supplier: "Supplier A",
    price: 12,
    currency: "USD",
  },
  {
    id: 4,
    brand: "BMW",
    model: "3 Series",
    year: 2021,
    partName: "Front Brake Pads",
    partNumber: "BP-BMW-3S-2021-F",
    supplier: "Supplier C",
    price: 85,
    currency: "USD",
  },
  {
    id: 5,
    brand: "BMW",
    model: "3 Series",
    year: 2021,
    partName: "Oil Filter",
    partNumber: "OF-BMW-3S-2021",
    supplier: "Supplier C",
    price: 18,
    currency: "USD",
  },
];