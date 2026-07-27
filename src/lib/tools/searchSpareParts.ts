import { prisma } from "@/lib/db/prisma";

type SearchParams = {
  brand?: string;
  model?: string;
  year?: number;
  partName?: string;
};

export async function searchSpareParts({
  brand,
  model,
  year,
  partName,
}: SearchParams) {
  const results = await prisma.supplierPartPrice.findMany({
    where: {
      available: true,

      // Car filters
      ...(brand || model || year
        ? {
            variant: {
              ...(year
                ? {
                    year,
                  }
                : {}),

              ...(model || brand
                ? {
                    model: {
                      ...(model
                        ? {
                            name: {
                              contains: model,
                              mode: "insensitive",
                            },
                          }
                        : {}),

                      ...(brand
                        ? {
                            brand: {
                              name: {
                                contains: brand,
                                mode: "insensitive",
                              },
                            },
                          }
                        : {}),
                    },
                  }
                : {}),
            },
          }
        : {}),

      // Spare part filter
      ...(partName
        ? {
            sparePart: {
              name: {
                contains: partName,
                mode: "insensitive",
              },
            },
          }
        : {}),
    },

    include: {
      variant: {
        include: {
          model: {
            include: {
              brand: true,
            },
          },
        },
      },

      sparePart: true,

      supplier: true,
    },

    orderBy: {
      price: "asc",
    },
  });

  return results.map((item) => ({
    id: item.id,

    car: {
      brand: item.variant.model.brand.name,
      model: item.variant.model.name,
      year: item.variant.year,
      variant: item.variant.name,
    },

    sparePart: {
      name: item.sparePart.name,
      partNumber: item.sparePart.partNumber,
      category: item.sparePart.category,
    },

    supplier: {
      name: item.supplier.name,
      contactName: item.supplier.contactName,
      phone: item.supplier.phone,
      email: item.supplier.email,
    },

    price: item.price.toString(),

    currency: item.currency,

    available: item.available,
  }));
}