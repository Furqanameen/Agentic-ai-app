import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // -----------------------------------
  // 1. Car Brand
  // -----------------------------------

  const toyota = await prisma.carBrand.upsert({
    where: {
      name: "Toyota",
    },
    update: {},
    create: {
      name: "Toyota",
    },
  });

  const honda = await prisma.carBrand.upsert({
    where: {
      name: "Honda",
    },
    update: {},
    create: {
      name: "Honda",
    },
  });

  // -----------------------------------
  // 2. Car Models
  // -----------------------------------

  const camry = await prisma.carModel.upsert({
    where: {
      brandId_name: {
        brandId: toyota.id,
        name: "Camry",
      },
    },
    update: {},
    create: {
      name: "Camry",
      brandId: toyota.id,
    },
  });

  const corolla = await prisma.carModel.upsert({
    where: {
      brandId_name: {
        brandId: toyota.id,
        name: "Corolla",
      },
    },
    update: {},
    create: {
      name: "Corolla",
      brandId: toyota.id,
    },
  });

  const civic = await prisma.carModel.upsert({
    where: {
      brandId_name: {
        brandId: honda.id,
        name: "Civic",
      },
    },
    update: {},
    create: {
      name: "Civic",
      brandId: honda.id,
    },
  });

  // -----------------------------------
  // 3. Car Variants / Years
  // -----------------------------------

  const camry2020 = await prisma.carVariant.upsert({
    where: {
      modelId_year_name: {
        modelId: camry.id,
        year: 2020,
        name: "2.5L",
      },
    },
    update: {},
    create: {
      modelId: camry.id,
      year: 2020,
      name: "2.5L",
    },
  });

  const camry2021 = await prisma.carVariant.upsert({
    where: {
      modelId_year_name: {
        modelId: camry.id,
        year: 2021,
        name: "2.5L",
      },
    },
    update: {},
    create: {
      modelId: camry.id,
      year: 2021,
      name: "2.5L",
    },
  });

  const corolla2020 = await prisma.carVariant.upsert({
    where: {
      modelId_year_name: {
        modelId: corolla.id,
        year: 2020,
        name: "1.8L",
      },
    },
    update: {},
    create: {
      modelId: corolla.id,
      year: 2020,
      name: "1.8L",
    },
  });

  const civic2020 = await prisma.carVariant.upsert({
    where: {
      modelId_year_name: {
        modelId: civic.id,
        year: 2020,
        name: "1.5L Turbo",
      },
    },
    update: {},
    create: {
      modelId: civic.id,
      year: 2020,
      name: "1.5L Turbo",
    },
  });

  // -----------------------------------
  // 4. Spare Parts
  // -----------------------------------

  const brakePads = await prisma.sparePart.create({
    data: {
      name: "Brake Pads",
      partNumber: "BP-TOY-CAM-2020",
      category: "Brakes",
    },
  });

  const oilFilter = await prisma.sparePart.create({
    data: {
      name: "Oil Filter",
      partNumber: "OF-TOY-001",
      category: "Engine",
    },
  });

  const airFilter = await prisma.sparePart.create({
    data: {
      name: "Air Filter",
      partNumber: "AF-TOY-001",
      category: "Engine",
    },
  });

  const sparkPlugs = await prisma.sparePart.create({
    data: {
      name: "Spark Plugs",
      partNumber: "SP-TOY-001",
      category: "Ignition",
    },
  });

  // -----------------------------------
  // 5. Suppliers
  // -----------------------------------

  const autoPartsDirect = await prisma.supplier.upsert({
    where: {
      name: "Auto Parts Direct",
    },
    update: {},
    create: {
      name: "Auto Parts Direct",
      contactName: "John Smith",
      phone: "+44 7000 111111",
      email: "sales@autopartsdirect.example",
    },
  });

  const premiumAutoParts = await prisma.supplier.upsert({
    where: {
      name: "Premium Auto Parts",
    },
    update: {},
    create: {
      name: "Premium Auto Parts",
      contactName: "Sarah Williams",
      phone: "+44 7000 222222",
      email: "sales@premiumautoparts.example",
    },
  });

  const fastParts = await prisma.supplier.upsert({
    where: {
      name: "Fast Parts UK",
    },
    update: {},
    create: {
      name: "Fast Parts UK",
      contactName: "Mike Johnson",
      phone: "+44 7000 333333",
      email: "sales@fastparts.example",
    },
  });

  // -----------------------------------
  // 6. Supplier Prices
  // -----------------------------------

  await prisma.supplierPartPrice.createMany({
    data: [
      // Toyota Camry 2020 - Brake Pads
      {
        variantId: camry2020.id,
        sparePartId: brakePads.id,
        supplierId: autoPartsDirect.id,
        price: 45.5,
        currency: "GBP",
        available: true,
      },
      {
        variantId: camry2020.id,
        sparePartId: brakePads.id,
        supplierId: premiumAutoParts.id,
        price: 52.99,
        currency: "GBP",
        available: true,
      },
      {
        variantId: camry2020.id,
        sparePartId: brakePads.id,
        supplierId: fastParts.id,
        price: 41.99,
        currency: "GBP",
        available: true,
      },

      // Toyota Camry 2020 - Oil Filter
      {
        variantId: camry2020.id,
        sparePartId: oilFilter.id,
        supplierId: autoPartsDirect.id,
        price: 12.5,
        currency: "GBP",
        available: true,
      },
      {
        variantId: camry2020.id,
        sparePartId: oilFilter.id,
        supplierId: premiumAutoParts.id,
        price: 15.0,
        currency: "GBP",
        available: true,
      },

      // Toyota Camry 2020 - Air Filter
      {
        variantId: camry2020.id,
        sparePartId: airFilter.id,
        supplierId: autoPartsDirect.id,
        price: 18.99,
        currency: "GBP",
        available: true,
      },

      // Toyota Camry 2021 - Brake Pads
      {
        variantId: camry2021.id,
        sparePartId: brakePads.id,
        supplierId: autoPartsDirect.id,
        price: 48.5,
        currency: "GBP",
        available: true,
      },

      // Toyota Corolla 2020 - Oil Filter
      {
        variantId: corolla2020.id,
        sparePartId: oilFilter.id,
        supplierId: fastParts.id,
        price: 10.99,
        currency: "GBP",
        available: true,
      },

      // Honda Civic 2020 - Spark Plugs
      {
        variantId: civic2020.id,
        sparePartId: sparkPlugs.id,
        supplierId: premiumAutoParts.id,
        price: 35.99,
        currency: "GBP",
        available: true,
      },
    ],
  });

  console.log("✅ Database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
