import { searchSpareParts } from "./searchSpareParts";

const results = searchSpareParts({
  brand: "Toyota",
  model: "Camry",
  year: 2020,
  partName: "Brake Pads",
});

console.log(results);