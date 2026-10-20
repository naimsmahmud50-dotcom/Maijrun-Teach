import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { shippingConfig } from "../config/shipping";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  logger.info("Seeding store data for MAIJRUN Tech...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  // Configure supported currencies with BDT as default for Bangladesh & USD/EUR
  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "bdt",
          is_default: true,
        },
        {
          currency_code: "usd",
        },
        {
          currency_code: "eur",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // Seed Bangladesh region (idempotent check)
  logger.info("Checking & seeding region data...");
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });

  let bdRegion: any = existingRegions.find((r: any) => r.currency_code === "bdt");

  if (!bdRegion) {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Bangladesh",
            currency_code: "bdt",
            countries: ["bd"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    bdRegion = regionResult[0];
    logger.info("Created Bangladesh region (BDT).");
  } else {
    logger.info("Bangladesh region already exists.");
  }

  // Check tax region for Bangladesh
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  });

  if (!existingTaxRegions.some((t: any) => t.country_code === "bd")) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "bd",
          provider_id: "tp_system",
        },
      ],
    });
    logger.info("Created Bangladesh tax region.");
  }

  // Stock Location (Dhaka Central Hub)
  logger.info("Checking & seeding stock location...");
  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });

  let stockLocation: any = existingLocations.find(
    (l: any) => l.name === "MAIJRUN Dhaka Central Hub"
  );

  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "MAIJRUN Dhaka Central Hub",
            address: {
              city: "Dhaka",
              country_code: "BD",
              address_1: "Motijheel Commercial Area",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          default_location_id: stockLocation.id,
        },
      },
    });

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  }

  // Shipping Profiles & Fulfillment Sets
  logger.info("Checking fulfillment & shipping options...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "MAIJRUN Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "MAIJRUN Bangladesh Delivery Network",
  });
  let fulfillmentSet = fulfillmentSets.length ? fulfillmentSets[0] : null;

  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "MAIJRUN Bangladesh Delivery Network",
      type: "shipping",
      service_zones: [
        {
          name: "Bangladesh Delivery Zone",
          geo_zones: [
            {
              country_code: "bd",
              type: "country",
            },
          ],
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
  }

  // Seed shipping options: Inside Dhaka (৳80) and Outside Dhaka (৳150)
  const { data: existingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
  });

  const hasInsideDhaka = existingOptions.some((o: any) =>
    o.name.includes("Inside Dhaka")
  );
  const hasOutsideDhaka = existingOptions.some((o: any) =>
    o.name.includes("Outside Dhaka")
  );

  const serviceZoneId =
    fulfillmentSet.service_zones && fulfillmentSet.service_zones.length
      ? fulfillmentSet.service_zones[0].id
      : (
          await fulfillmentModuleService.retrieveFulfillmentSet(
            fulfillmentSet.id,
            { relations: ["service_zones"] }
          )
        ).service_zones[0].id;

  const newShippingOptions: any[] = [];

  if (!hasInsideDhaka) {
    newShippingOptions.push({
      name: shippingConfig.insideDhaka.name,
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Standard Inside Dhaka",
        description: shippingConfig.insideDhaka.description,
        code: shippingConfig.insideDhaka.code,
      },
      prices: [
        {
          currency_code: "bdt",
          amount: shippingConfig.insideDhaka.amount,
        },
        {
          region_id: bdRegion.id,
          amount: shippingConfig.insideDhaka.amount,
        },
        {
          currency_code: "usd",
          amount: 1,
        },
      ],
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq" as const,
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq" as const,
        },
      ],
    });
  }

  if (!hasOutsideDhaka) {
    newShippingOptions.push({
      name: shippingConfig.outsideDhaka.name,
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Courier Outside Dhaka",
        description: shippingConfig.outsideDhaka.description,
        code: shippingConfig.outsideDhaka.code,
      },
      prices: [
        {
          currency_code: "bdt",
          amount: shippingConfig.outsideDhaka.amount,
        },
        {
          region_id: bdRegion.id,
          amount: shippingConfig.outsideDhaka.amount,
        },
        {
          currency_code: "usd",
          amount: 2,
        },
      ],
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq" as const,
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq" as const,
        },
      ],
    });
  }

  if (newShippingOptions.length > 0) {
    await createShippingOptionsWorkflow(container).run({
      input: newShippingOptions,
    });
    logger.info(`Seeded ${newShippingOptions.length} shipping options.`);
  }

  // Publishable API Key
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title"],
    filters: { type: "publishable" },
  });

  let publishableApiKey: any = apiKeys?.[0];
  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "MAIJRUN Tech Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableApiKey = publishableApiKeyResult;

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  }

  // Seed Categories
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  let categoryMap: Record<string, string> = {};
  for (const c of existingCats) {
    categoryMap[c.name] = c.id;
  }

  const categoryNames = ["Laptops", "Desktops", "Components", "Accessories"];
  const categoriesToCreate = categoryNames.filter((name) => !categoryMap[name]);

  if (categoriesToCreate.length > 0) {
    const { result: categoryResult } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: categoriesToCreate.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    for (const c of categoryResult) {
      categoryMap[c.name] = c.id;
    }
  }

  // Seed Realistic Laptop & Desktop Products (with specs & BDT prices)
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle));

  const demoProducts = [
    {
      title: "ASUS ROG Zephyrus G16 (2024)",
      handle: "asus-rog-zephyrus-g16",
      category_ids: [categoryMap["Laptops"]],
      description:
        "[Demo] Ultra-slim 16-inch gaming powerhouse with Intel Core i9, RTX 4080 graphics, and stunning 2.5K 240Hz OLED Nebula display. Built for elite creators and gamers.",
      weight: 1850,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        specs: {
          brand: "Asus",
          processor: "Intel Core i9-14900HX (24 cores, up to 5.8 GHz)",
          processorFamily: "Core i9",
          ram: "32GB LPDDR5X 7467MHz",
          storage: "2TB PCIe 4.0 NVMe M.2 SSD",
          gpu: "NVIDIA GeForce RTX 4080 12GB GDDR6",
          display: "16-inch 2.5K (2560x1600) 240Hz 0.2ms OLED, 100% DCI-P3",
          battery: "90Wh Li-ion with 240W Fast Charger",
          os: "Windows 11 Home Genuine",
          ports: "1x Thunderbolt 4, 1x USB-C 3.2, 2x USB-A 3.2, 1x HDMI 2.1, SD Express 7.0, 3.5mm Jack",
          weight: "1.85 kg",
          warranty: "2 Years Official Asus Warranty",
          isDemo: true,
        },
      },
      images: [
        {
          url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
        },
      ],
      options: [{ title: "Color", values: ["Eclipse Gray"] }],
      variants: [
        {
          title: "Eclipse Gray / 32GB / 2TB",
          sku: "ASUS-G16-01",
          options: { Color: "Eclipse Gray" },
          prices: [
            { amount: 320000, currency_code: "bdt" },
            { amount: 2850, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Lenovo Legion Pro 5 16\" Gaming Laptop",
      handle: "lenovo-legion-pro-5",
      category_ids: [categoryMap["Laptops"]],
      description:
        "[Demo] AI-tuned high-performance gaming laptop with AMD Ryzen 7 7745HX and RTX 4070. Features ColdFront 5.0 cooling and WQXGA 240Hz PureSight display.",
      weight: 2550,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        specs: {
          brand: "Lenovo",
          processor: "AMD Ryzen 7 7745HX (8 cores, 16 threads, up to 5.1 GHz)",
          processorFamily: "Ryzen 7",
          ram: "16GB DDR5 5200MHz (Upgradable to 64GB)",
          storage: "1TB PCIe Gen4 NVMe SSD",
          gpu: "NVIDIA GeForce RTX 4070 8GB GDDR6 (140W TGP)",
          display: "16-inch WQXGA (2560x1600) IPS 240Hz 500 nits, DisplayHDR 400",
          battery: "80Wh with Super Rapid Charge Pro",
          os: "Windows 11 Home",
          ports: "4x USB 3.2 Gen 1, 2x USB-C 3.2 Gen 2, HDMI 2.1, RJ-45 Gigabit LAN",
          weight: "2.55 kg",
          warranty: "2 Years Official Lenovo Warranty",
          isDemo: true,
        },
      },
      images: [
        {
          url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
        },
      ],
      options: [{ title: "Color", values: ["Onyx Grey"] }],
      variants: [
        {
          title: "Onyx Grey / 16GB / 1TB",
          sku: "LENOVO-LEGION-01",
          options: { Color: "Onyx Grey" },
          prices: [
            { amount: 195000, currency_code: "bdt" },
            { amount: 1750, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Apple MacBook Pro 14\" (M3 Pro)",
      handle: "apple-macbook-pro-14-m3-pro",
      category_ids: [categoryMap["Laptops"]],
      description:
        "[Demo] Pro performance in a portable package. Groundbreaking M3 Pro chip with hardware-accelerated ray tracing, Liquid Retina XDR display, and up to 18 hours battery life.",
      weight: 1610,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        specs: {
          brand: "Apple",
          processor: "Apple M3 Pro (11-Core CPU with 5 performance and 6 efficiency cores)",
          processorFamily: "Apple M-Series",
          ram: "18GB Unified Memory",
          storage: "512GB Fast PCIe SSD",
          gpu: "14-Core Integrated GPU with Hardware Ray Tracing",
          display: "14.2-inch Liquid Retina XDR (3024x1964) 120Hz ProMotion, 1000 nits sustained",
          battery: "70Wh Li-Po (Up to 18 hours Apple TV app playback)",
          os: "macOS Sonoma",
          ports: "3x Thunderbolt 4, HDMI port, SDXC card slot, 3.5mm headphone jack, MagSafe 3",
          weight: "1.61 kg",
          warranty: "1 Year Official Apple Warranty",
          isDemo: true,
        },
      },
      images: [
        {
          url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
        },
      ],
      options: [{ title: "Color", values: ["Space Black"] }],
      variants: [
        {
          title: "Space Black / 18GB / 512GB",
          sku: "APPLE-MBP14-01",
          options: { Color: "Space Black" },
          prices: [
            { amount: 245000, currency_code: "bdt" },
            { amount: 2199, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "HP Pavilion 15 Core i5 Laptop",
      handle: "hp-pavilion-15-i5",
      category_ids: [categoryMap["Laptops"]],
      description:
        "[Demo] Everyday productivity with Intel Core i5 13th Gen, anti-glare micro-edge display, dual speakers by B&O, and HP Fast Charge technology.",
      weight: 1740,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        specs: {
          brand: "HP",
          processor: "Intel Core i5-1335U (10 cores, up to 4.6 GHz)",
          processorFamily: "Core i5",
          ram: "16GB DDR4 3200MHz",
          storage: "512GB PCIe NVMe M.2 SSD",
          gpu: "Intel Iris Xe Graphics",
          display: "15.6-inch FHD (1920x1080) IPS micro-edge anti-glare",
          battery: "41Wh Li-ion (Supports fast charge: 50% in 45 mins)",
          os: "Windows 11 Home Genuine",
          ports: "1x USB-C 10Gbps, 2x USB-A 5Gbps, 1x HDMI 2.1, 1x headphone/microphone combo",
          weight: "1.74 kg",
          warranty: "2 Years Official HP Warranty",
          isDemo: true,
        },
      },
      images: [
        {
          url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
        },
      ],
      options: [{ title: "Color", values: ["Natural Silver"] }],
      variants: [
        {
          title: "Natural Silver / 16GB / 512GB",
          sku: "HP-PAV15-01",
          options: { Color: "Natural Silver" },
          prices: [
            { amount: 82000, currency_code: "bdt" },
            { amount: 750, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Dell XPS 15 9530 OLED Workstation",
      handle: "dell-xps-15-9530",
      category_ids: [categoryMap["Laptops"]],
      description:
        "[Demo] Masterful craftsmanship with CNC machined aluminum, carbon fiber palm rest, Core i7 13th Gen, RTX 4060, and breathtaking 3.5K OLED touchscreen.",
      weight: 1920,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        specs: {
          brand: "Dell",
          processor: "Intel Core i7-13700H (14 cores, 20 threads, up to 5.0 GHz)",
          processorFamily: "Core i7",
          ram: "32GB DDR5 4800MHz Dual-Channel",
          storage: "1TB PCIe Gen4 NVMe SSD",
          gpu: "NVIDIA GeForce RTX 4060 8GB GDDR6 (50W)",
          display: "15.6-inch 3.5K (3456x2160) OLED InfinityEdge Touch, 400 nits, 100% DCI-P3",
          battery: "86Wh 6-Cell Integrated with 130W USB-C Adapter",
          os: "Windows 11 Pro Genuine",
          ports: "2x Thunderbolt 4, 1x USB-C 3.2 Gen 2, Full size SD Card Reader v6.0, 3.5mm Jack",
          weight: "1.92 kg",
          warranty: "3 Years Official Dell ProSupport",
          isDemo: true,
        },
      },
      images: [
        {
          url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
        },
      ],
      options: [{ title: "Color", values: ["Platinum Silver"] }],
      variants: [
        {
          title: "Platinum Silver / 32GB / 1TB",
          sku: "DELL-XPS15-01",
          options: { Color: "Platinum Silver" },
          prices: [
            { amount: 265000, currency_code: "bdt" },
            { amount: 2400, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "MAIJRUN Horizon Creator Desktop Workstation",
      handle: "maijrun-horizon-creator-pc",
      category_ids: [categoryMap["Desktops"]],
      description:
        "[Demo] Flagship desktop workstation handcrafted by MAIJRUN Tech. Features AMD Ryzen 9 7950X, liquid cooling, 64GB DDR5 memory, and GeForce RTX 4090 24GB.",
      weight: 14500,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      metadata: {
        specs: {
          brand: "MAIJRUN",
          processor: "AMD Ryzen 9 7950X (16 cores, 32 threads, up to 5.7 GHz Boost)",
          processorFamily: "Ryzen 9",
          ram: "64GB DDR5 6000MHz Corsair Vengeance RGB",
          storage: "2TB Samsung 990 Pro PCIe 4.0 NVMe SSD",
          gpu: "NVIDIA GeForce RTX 4090 24GB GDDR6X",
          display: "Supports up to 4x 4K @ 144Hz Displays or 2x 8K Displays",
          battery: "1000W 80+ Gold Fully Modular ATX 3.0 Power Supply",
          os: "Windows 11 Pro Genuine Pre-Activated",
          ports: "2x USB 3.2 Gen 2x2 Type-C, 8x USB 3.2 Type-A, 2.5G Realtek LAN, Wi-Fi 6E, Bluetooth 5.3",
          weight: "14.5 kg",
          warranty: "3 Years Comprehensive MAIJRUN Tech Warranty",
          isDemo: true,
        },
      },
      images: [
        {
          url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
        },
      ],
      options: [{ title: "Edition", values: ["Titanium Black Edition"] }],
      variants: [
        {
          title: "Titanium Black Edition / 64GB / 2TB",
          sku: "MAIJRUN-HORIZON-01",
          options: { Edition: "Titanium Black Edition" },
          prices: [
            { amount: 450000, currency_code: "bdt" },
            { amount: 3999, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
  ];

  const productsToSeed = demoProducts.filter((p) => !existingHandles.has(p.handle));

  if (productsToSeed.length > 0) {
    await createProductsWorkflow(container).run({
      input: {
        products: productsToSeed,
      },
    });
    logger.info(`Seeded ${productsToSeed.length} new laptop and desktop products.`);
  } else {
    logger.info("Demo products already seeded.");
  }

  // Seed Inventory Levels with varied stock (In Stock, Low Stock, Out of Stock)
  logger.info("Updating inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });

  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id"],
  });
  const existingLevelSet = new Set(
    existingLevels.map((l: any) => l.inventory_item_id)
  );

  const stockMap: Record<string, number> = {
    "ASUS-G16-01": 8,        // In Stock
    "LENOVO-LEGION-01": 3,   // Low Stock (<= 5)
    "APPLE-MBP14-01": 12,    // In Stock
    "HP-PAV15-01": 15,       // In Stock
    "DELL-XPS15-01": 0,      // Out of Stock
    "MAIJRUN-HORIZON-01": 5, // Low Stock (threshold edge)
  };

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  if (stockLocation) {
    for (const item of inventoryItems) {
      if (!existingLevelSet.has(item.id)) {
        const targetQty =
          item.sku && stockMap[item.sku] !== undefined ? stockMap[item.sku] : 10;
        inventoryLevels.push({
          location_id: stockLocation.id,
          stocked_quantity: targetQty,
          inventory_item_id: item.id,
        });
      }
    }
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
    logger.info(`Configured inventory levels for ${inventoryLevels.length} items.`);
  }

  logger.info("MAIJRUN Tech seeding completed successfully!");
}
