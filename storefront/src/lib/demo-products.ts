import { HttpTypes } from "@medusajs/types"

/**
 * Official MAIJRUN Tech Enterprise Catalog
 * Production hardware across Laptops, Desktops, Flagship Phones, Audio, Displays & Components.
 * Real BDT pricing, structured specs, color swatches, and high-res imagery.
 */
export const DEMO_PRODUCTS: HttpTypes.StoreProduct[] = [
  // --- 1. LAPTOPS ---
  {
    id: "prod_macbook_pro_16_m4",
    title: "Apple MacBook Pro 16\" (M4 Pro Chip)",
    handle: "apple-macbook-pro-16-m4-pro",
    description: "Built for groundbreaking workflows. Powered by the next-gen M4 Pro chip with 14-core CPU, 20-core GPU, Liquid Retina XDR display with 1600 nits peak brightness, and up to 24 hours of battery life.",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    images: [
      { id: "img_mbp16_1", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80" },
      { id: "img_mbp16_2", url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80" },
    ],
    categories: [{ id: "cat_laptops", name: "Laptops" } as any],
    options: [
      {
        id: "opt_mbp16_color",
        title: "Color",
        values: ["Space Black", "Silver"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Apple",
        processor: "Apple M4 Pro (14-Core CPU, 20-Core GPU)",
        processorFamily: "Apple M-Series",
        ram: "24GB Unified Memory (Up to 273GB/s bandwidth)",
        storage: "512GB Ultra-Fast PCIe NVMe SSD",
        gpu: "20-Core Hardware Ray Tracing GPU",
        display: "16.2-inch Liquid Retina XDR (3456x2234) 120Hz ProMotion, 1600 nits",
        battery: "100Wh Li-Po (Up to 24 hours battery life)",
        os: "macOS Sequoia",
        ports: "3x Thunderbolt 5, HDMI 2.1, SDXC slot, MagSafe 3, 3.5mm headphone jack",
        weight: "2.14 kg",
        warranty: "1 Year Official Apple International Warranty",
      },
    },
    variants: [
      {
        id: "variant_mbp16_black",
        title: "Space Black",
        sku: "APL-MBP16-SB",
        inventory_quantity: 12,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_mbp16_color", value: "Space Black" }],
        calculated_price: {
          calculated_amount: 310000,
          original_amount: 325000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
      {
        id: "variant_mbp16_silver",
        title: "Silver",
        sku: "APL-MBP16-SL",
        inventory_quantity: 8,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_mbp16_color", value: "Silver" }],
        calculated_price: {
          calculated_amount: 310000,
          original_amount: 325000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_asus_zephyrus_g16",
    title: "Asus ROG Zephyrus G16 (2025)",
    handle: "asus-rog-zephyrus-g16",
    description: "The pinnacle of thin & light gaming engineering. CNC unibody aluminum chassis holding an Intel Core Ultra 9 185H processor, NVIDIA GeForce RTX 4080 12GB graphics, and ROG Nebula 2.5K 240Hz OLED panel.",
    thumbnail: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    images: [
      { id: "img_g16_1", url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80" },
      { id: "img_g16_2", url: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80" },
    ],
    categories: [{ id: "cat_laptops", name: "Laptops" } as any],
    options: [
      {
        id: "opt_g16_color",
        title: "Color",
        values: ["Eclipse Gray", "Platinum White"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Asus",
        processor: "Intel Core Ultra 9 185H (16 cores, 22 threads, up to 5.1GHz)",
        processorFamily: "Core i9",
        ram: "32GB LPDDR5X 7467MHz",
        storage: "2TB PCIe 4.0 NVMe M.2 SSD",
        gpu: "NVIDIA GeForce RTX 4080 12GB GDDR6 (115W TGP)",
        display: "16-inch 2.5K (2560x1600) 240Hz 0.2ms ROG Nebula OLED, 100% DCI-P3",
        battery: "90Wh Li-ion with 240W Fast Charger",
        os: "Windows 11 Home Genuine",
        ports: "1x Thunderbolt 4, 1x USB-C 3.2, 2x USB-A 3.2, 1x HDMI 2.1, SD Express 7.0",
        weight: "1.85 kg",
        warranty: "2 Years Official Asus Warranty",
      },
    },
    variants: [
      {
        id: "variant_g16_gray",
        title: "Eclipse Gray",
        sku: "ASUS-ROG-G16-GR",
        inventory_quantity: 6,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_g16_color", value: "Eclipse Gray" }],
        calculated_price: {
          calculated_amount: 325000,
          original_amount: 340000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
      {
        id: "variant_g16_white",
        title: "Platinum White",
        sku: "ASUS-ROG-G16-WH",
        inventory_quantity: 4,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_g16_color", value: "Platinum White" }],
        calculated_price: {
          calculated_amount: 325000,
          original_amount: 340000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_lenovo_legion_pro5",
    title: "Lenovo Legion Pro 5 AMD Ryzen 7",
    handle: "lenovo-legion-pro-5",
    description: "AI-tuned esports battle station. Features AMD Ryzen 7 7745HX octa-core processor, full-power NVIDIA GeForce RTX 4070 8GB GPU, and Legion ColdFront 5.0 thermal technology.",
    thumbnail: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
    images: [{ id: "img_legion_1", url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80" }],
    categories: [{ id: "cat_laptops", name: "Laptops" } as any],
    options: [
      {
        id: "opt_legion_color",
        title: "Color",
        values: ["Onyx Grey"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Lenovo",
        processor: "AMD Ryzen 7 7745HX (8 Cores, 16 Threads, up to 5.1GHz)",
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
      },
    },
    variants: [
      {
        id: "variant_legion_pro5_std",
        title: "Onyx Grey",
        sku: "LENOVO-LEG-P5-01",
        inventory_quantity: 10,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_legion_color", value: "Onyx Grey" }],
        calculated_price: {
          calculated_amount: 195000,
          original_amount: 205000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_macbook_air_15_m3",
    title: "Apple MacBook Air 15\" (M3 Chip)",
    handle: "apple-macbook-air-15-m3",
    description: "Impossibly thin. Incredibly fast. The 15-inch MacBook Air gives you more room for what you love with a spacious Liquid Retina display, powered by the blazing M3 chip.",
    thumbnail: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80",
    images: [{ id: "img_mba15_1", url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80" }],
    categories: [{ id: "cat_laptops", name: "Laptops" } as any],
    options: [
      {
        id: "opt_mba15_color",
        title: "Color",
        values: ["Midnight", "Starlight", "Space Gray"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Apple",
        processor: "Apple M3 (8-Core CPU with 4 performance and 4 efficiency cores)",
        processorFamily: "Apple M-Series",
        ram: "16GB Unified Memory",
        storage: "512GB Fast PCIe SSD",
        gpu: "10-Core Integrated GPU with Hardware Ray Tracing",
        display: "15.3-inch Liquid Retina Display (2880x1864) 500 nits, P3 Wide Color",
        battery: "66.5Wh Li-Po (Up to 18 hours battery life)",
        os: "macOS Sequoia",
        ports: "2x Thunderbolt / USB 4, MagSafe 3, 3.5mm headphone jack",
        weight: "1.51 kg",
        warranty: "1 Year Official Apple Warranty",
      },
    },
    variants: [
      {
        id: "variant_mba15_midnight",
        title: "Midnight",
        sku: "APL-MBA15-MN",
        inventory_quantity: 14,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_mba15_color", value: "Midnight" }],
        calculated_price: {
          calculated_amount: 185000,
          original_amount: 195000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
      {
        id: "variant_mba15_starlight",
        title: "Starlight",
        sku: "APL-MBA15-SL",
        inventory_quantity: 8,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_mba15_color", value: "Starlight" }],
        calculated_price: {
          calculated_amount: 185000,
          original_amount: 195000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_thinkpad_x1_carbon_g12",
    title: "Lenovo ThinkPad X1 Carbon Gen 12",
    handle: "lenovo-thinkpad-x1-carbon-gen12",
    description: "The gold standard for enterprise executive computing. Featherweight carbon-fiber chassis, Intel Core Ultra 7 processor with dedicated NPU, and legendary spill-resistant ThinkPad keyboard.",
    thumbnail: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    images: [{ id: "img_x1_1", url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80" }],
    categories: [{ id: "cat_laptops", name: "Laptops" } as any],
    options: [
      {
        id: "opt_x1_color",
        title: "Color",
        values: ["Deep Black"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Lenovo",
        processor: "Intel Core Ultra 7 155H (16 Cores, up to 4.8GHz, AI Boost NPU)",
        processorFamily: "Core i7",
        ram: "32GB LPDDR5X 6400MHz",
        storage: "1TB PCIe Gen4 Performance NVMe SSD",
        gpu: "Intel Arc Integrated Graphics",
        display: "14-inch 2.8K (2880x1800) OLED 120Hz 400 nits, 100% DCI-P3, HDR500",
        battery: "57Wh with Rapid Charge (80% in 60 mins)",
        os: "Windows 11 Pro Genuine",
        ports: "2x Thunderbolt 4, 2x USB-A 3.2, 1x HDMI 2.1, 3.5mm Audio",
        weight: "1.09 kg",
        warranty: "3 Years Official Premier Support Warranty",
      },
    },
    variants: [
      {
        id: "variant_x1_std",
        title: "Deep Black",
        sku: "LEN-X1C-G12-01",
        inventory_quantity: 7,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_x1_color", value: "Deep Black" }],
        calculated_price: {
          calculated_amount: 275000,
          original_amount: 290000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  // --- 2. FLAGSHIP SMARTPHONES & TABLETS ---
  {
    id: "prod_iphone_16_pro_max",
    title: "Apple iPhone 16 Pro Max",
    handle: "apple-iphone-16-pro-max",
    description: "The ultimate iPhone. Grade 5 titanium design, Camera Control button, 4K 120 fps Dolby Vision recording, and the industry-leading A18 Pro chip with Apple Intelligence.",
    thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    images: [{ id: "img_ip16_1", url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80" }],
    categories: [{ id: "cat_phones", name: "Smartphones" } as any],
    options: [
      {
        id: "opt_ip16_color",
        title: "Color",
        values: ["Desert Titanium", "Black Titanium", "Natural Titanium"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Apple",
        processor: "Apple A18 Pro (6-core CPU, 6-core GPU, 16-core Neural Engine)",
        ram: "8GB RAM",
        storage: "256GB NVMe High-Speed Storage",
        display: "6.9-inch Super Retina XDR OLED (2868x1320) 120Hz ProMotion, 2000 nits peak",
        battery: "4685mAh with MagSafe 25W Fast Wireless Charging",
        os: "iOS 18 with Apple Intelligence",
        ports: "USB-C 3.2 Gen 2 (up to 10Gb/s)",
        weight: "227 grams",
        warranty: "1 Year Official Apple International Warranty",
      },
    },
    variants: [
      {
        id: "variant_ip16_desert",
        title: "Desert Titanium",
        sku: "APL-IP16PM-DT",
        inventory_quantity: 15,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_ip16_color", value: "Desert Titanium" }],
        calculated_price: {
          calculated_amount: 178000,
          original_amount: 185000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
      {
        id: "variant_ip16_black",
        title: "Black Titanium",
        sku: "APL-IP16PM-BT",
        inventory_quantity: 11,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_ip16_color", value: "Black Titanium" }],
        calculated_price: {
          calculated_amount: 178000,
          original_amount: 185000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_samsung_galaxy_s25_ultra",
    title: "Samsung Galaxy S25 Ultra 5G",
    handle: "samsung-galaxy-s25-ultra",
    description: "Galaxy AI powerhouse. Snapdragon 8 Elite for Galaxy, built-in S Pen stylus, titanium frame, 200MP quad-telephoto camera system with 100x Space Zoom.",
    thumbnail: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
    images: [{ id: "img_s25_1", url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80" }],
    categories: [{ id: "cat_phones", name: "Smartphones" } as any],
    options: [
      {
        id: "opt_s25_color",
        title: "Color",
        values: ["Titanium Gray", "Titanium Black", "Titanium Blue"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Samsung",
        processor: "Qualcomm Snapdragon 8 Elite for Galaxy (3nm)",
        ram: "12GB LPDDR5X",
        storage: "256GB UFS 4.0 Storage",
        display: "6.86-inch Dynamic AMOLED 2X (3120x1440) 120Hz LTPO, 2600 nits, Anti-Reflective Armor",
        battery: "5000mAh with 45W Fast Charging",
        os: "Android 15 with One UI 7",
        ports: "USB-C 3.2, S Pen slot",
        weight: "219 grams",
        warranty: "1 Year Official Samsung Warranty",
      },
    },
    variants: [
      {
        id: "variant_s25_gray",
        title: "Titanium Gray",
        sku: "SAM-S25U-GR",
        inventory_quantity: 12,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_s25_color", value: "Titanium Gray" }],
        calculated_price: {
          calculated_amount: 165000,
          original_amount: 175000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_ipad_pro_13_m4",
    title: "Apple iPad Pro 13\" (M4 Chip OLED)",
    handle: "apple-ipad-pro-13-m4",
    description: "Thinpossible. The world's thinnest Apple product ever, featuring the revolutionary Ultra Retina XDR Tandem OLED display, Apple M4 chip, and support for Apple Pencil Pro.",
    thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    images: [{ id: "img_ipad_1", url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80" }],
    categories: [{ id: "cat_tablets", name: "Tablets" } as any],
    options: [
      {
        id: "opt_ipad_color",
        title: "Color",
        values: ["Space Black", "Silver"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Apple",
        processor: "Apple M4 (9-core CPU, 10-core GPU, 16-core NPU)",
        ram: "8GB Unified Memory",
        storage: "256GB PCIe Storage",
        display: "13-inch Ultra Retina XDR Tandem OLED (2752x2064) 120Hz ProMotion, 1000 nits full-screen",
        battery: "38.99Wh (Up to 10 hours web browsing)",
        os: "iPadOS 18",
        ports: "Thunderbolt / USB 4, Smart Connector, Magnetic connector",
        weight: "579 grams",
        warranty: "1 Year Official Apple Warranty",
      },
    },
    variants: [
      {
        id: "variant_ipad_black",
        title: "Space Black",
        sku: "APL-IPP13-SB",
        inventory_quantity: 9,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_ipad_color", value: "Space Black" }],
        calculated_price: {
          calculated_amount: 169000,
          original_amount: 178000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  // --- 3. CUSTOM DESKTOP SYSTEMS & PC BUILDS ---
  {
    id: "prod_maijrun_horizon_creator",
    title: "MAIJRUN Horizon Creator Workstation Desktop",
    handle: "maijrun-horizon-creator-workstation",
    description: "Engineered in-house for extreme 3D animation, 8K video color grading, and heavy machine learning workloads. Custom liquid-cooled with Lian Li O11 Dynamic EVO chassis.",
    thumbnail: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&q=80",
    images: [{ id: "img_horizon_1", url: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&q=80" }],
    categories: [{ id: "cat_desktops", name: "Desktops" } as any],
    options: [
      {
        id: "opt_horizon_color",
        title: "Color",
        values: ["Midnight Cyan", "Matte Black"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "MAIJRUN",
        processor: "AMD Ryzen 9 9950X (16 Cores, 32 Threads, up to 5.7GHz)",
        processorFamily: "Ryzen 9",
        ram: "64GB G.Skill Trident Z5 RGB DDR5 6000MHz",
        storage: "2TB Samsung 990 PRO Gen4 NVMe (7450 MB/s)",
        gpu: "NVIDIA GeForce RTX 4090 24GB GDDR6X",
        display: "Multi-Display Support up to 4x 4K 144Hz",
        battery: "Corsair RM1000x 1000W 80+ Gold Fully Modular PSU",
        os: "Windows 11 Pro Genuine",
        ports: "USB 3.2 Gen 2x2 Type-C, 8x USB-A, 2.5GbE LAN, Wi-Fi 7",
        weight: "14.5 kg",
        warranty: "3 Years Comprehensive MAIJRUN Desktop Warranty",
      },
    },
    variants: [
      {
        id: "variant_horizon_cyan",
        title: "Midnight Cyan",
        sku: "MJR-DSK-HORIZON",
        inventory_quantity: 5,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_horizon_color", value: "Midnight Cyan" }],
        calculated_price: {
          calculated_amount: 385000,
          original_amount: 410000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_maijrun_apex_battlestation",
    title: "MAIJRUN Apex BattleStation Gaming PC",
    handle: "maijrun-apex-battlestation",
    description: "Uncompromised 4K ultra-high-refresh gaming. Intel Core i9-14900K matched with NVIDIA GeForce RTX 4080 Super 16GB, NZXT Kraken 360 RGB liquid cooling, and PCIe 5.0 motherboard.",
    thumbnail: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80",
    images: [{ id: "img_apex_1", url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80" }],
    categories: [{ id: "cat_desktops", name: "Desktops" } as any],
    options: [
      {
        id: "opt_apex_color",
        title: "Color",
        values: ["Space Black"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "MAIJRUN",
        processor: "Intel Core i9-14900K (24 Cores, up to 6.0 GHz)",
        processorFamily: "Core i9",
        ram: "32GB Corsair Dominator Titanium DDR5 7200MHz",
        storage: "2TB Kingston KC3000 PCIe 4.0 NVMe SSD",
        gpu: "NVIDIA GeForce RTX 4080 Super 16GB GDDR6X",
        display: "Up to 8K resolution support",
        battery: "Antec NeoECO 850W 80+ Gold PSU",
        os: "Windows 11 Home",
        ports: "Thunderbolt 4, 10x USB Ports, 2.5G LAN, Wi-Fi 6E",
        weight: "13.2 kg",
        warranty: "3 Years Official MAIJRUN Warranty",
      },
    },
    variants: [
      {
        id: "variant_apex_black",
        title: "Space Black",
        sku: "MJR-DSK-APEX",
        inventory_quantity: 7,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_apex_color", value: "Space Black" }],
        calculated_price: {
          calculated_amount: 295000,
          original_amount: 315000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  // --- 4. HIGH-END AUDIO & PERIPHERALS ---
  {
    id: "prod_sony_wh1000xm5",
    title: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    handle: "sony-wh-1000xm5",
    description: "Industry-leading noise cancelation optimized automatically by two processors and eight microphones. Magnificent sound engineered with the new Integrated Processor V1 and LDAC high-resolution audio.",
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    images: [{ id: "img_sony_1", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" }],
    categories: [{ id: "cat_audio", name: "Audio" } as any],
    options: [
      {
        id: "opt_sony_color",
        title: "Color",
        values: ["Black", "Silver", "Midnight Blue"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Sony",
        processor: "Integrated Processor V1 + HD Noise Canceling Processor QN1",
        battery: "Up to 30 hours playback (3 min charge = 3 hours playback)",
        ports: "USB-C charging, 3.5mm stereo mini jack",
        weight: "250 grams",
        warranty: "1 Year Official Sony Warranty",
      },
    },
    variants: [
      {
        id: "variant_sony_black",
        title: "Black",
        sku: "SNY-WH5-BK",
        inventory_quantity: 20,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_sony_color", value: "Black" }],
        calculated_price: {
          calculated_amount: 38500,
          original_amount: 42000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_apple_airpods_max",
    title: "Apple AirPods Max (USB-C)",
    handle: "apple-airpods-max-usbc",
    description: "High-fidelity audio with active noise cancellation and transparency mode. Custom acoustic design with Apple-designed H1 chips in each ear cup and computational audio.",
    thumbnail: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    images: [{ id: "img_apm_1", url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80" }],
    categories: [{ id: "cat_audio", name: "Audio" } as any],
    options: [
      {
        id: "opt_apm_color",
        title: "Color",
        values: ["Midnight", "Starlight", "Space Gray"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Apple",
        processor: "Apple H1 headphone chip (each ear cup)",
        battery: "Up to 20 hours with Active Noise Cancellation enabled",
        ports: "USB-C port for charging and lossless wired audio",
        weight: "384.8 grams",
        warranty: "1 Year Official Apple Warranty",
      },
    },
    variants: [
      {
        id: "variant_apm_midnight",
        title: "Midnight",
        sku: "APL-APM-MN",
        inventory_quantity: 8,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_apm_color", value: "Midnight" }],
        calculated_price: {
          calculated_amount: 68000,
          original_amount: 72000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  {
    id: "prod_keychron_q1_pro",
    title: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
    handle: "keychron-q1-pro-mechanical-keyboard",
    description: "Full CNC machined aluminum body, 75% compact layout, hot-swappable Keychron K Pro Banana/Red switches, double-gasket design, and QMK/VIA programmable firmware.",
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    images: [{ id: "img_q1_1", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80" }],
    categories: [{ id: "cat_accessories", name: "Accessories" } as any],
    options: [
      {
        id: "opt_q1_color",
        title: "Color",
        values: ["Carbon Black", "Retro White"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "Keychron",
        battery: "4000mAh Rechargeable Li-polymer (Up to 300 hours)",
        ports: "Bluetooth 5.1 & Type-C Wired",
        weight: "1.73 kg (Full Metal Aluminum)",
        warranty: "1 Year Official Keychron Warranty",
      },
    },
    variants: [
      {
        id: "variant_q1_black",
        title: "Carbon Black",
        sku: "KEY-Q1P-BK",
        inventory_quantity: 16,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_q1_color", value: "Carbon Black" }],
        calculated_price: {
          calculated_amount: 24500,
          original_amount: 26500,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,

  // --- 5. MONITORS & DISPLAYS ---
  {
    id: "prod_lg_ultragear_32_oled",
    title: "LG UltraGear 32\" 4K Dual-Hz OLED Gaming Monitor",
    handle: "lg-ultragear-32-oled-4k",
    description: "The world's first VESA certified Dual-Hz gaming display: toggle between 4K UHD 240Hz for cinematic visuals or FHD 480Hz for ultra-fast competitive esports, featuring 0.03ms GtG response time.",
    thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    images: [{ id: "img_lg_1", url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80" }],
    categories: [{ id: "cat_components", name: "Components" } as any],
    options: [
      {
        id: "opt_lg_color",
        title: "Color",
        values: ["Matte Black"] as any,
      },
    ],
    metadata: {
      specs: {
        brand: "LG",
        display: '31.5" 4K UHD (3840x2160) 240Hz / FHD 480Hz Dual-Mode OLED, 0.03ms, DisplayHDR True Black 400',
        ports: "2x HDMI 2.1, 1x DisplayPort 1.4 (DSC), 2x USB 3.0 Hub, 4-pole DTS Headphone:X",
        warranty: "3 Years Official LG Warranty (with OLED Burn-In Coverage)",
      },
    },
    variants: [
      {
        id: "variant_lg_black",
        title: "Matte Black",
        sku: "LG-32GS95UE",
        inventory_quantity: 6,
        manage_inventory: true,
        allow_backorder: false,
        options: [{ option_id: "opt_lg_color", value: "Matte Black" }],
        calculated_price: {
          calculated_amount: 175000,
          original_amount: 185000,
          currency_code: "bdt",
          price_list_type: "default",
        },
      },
    ] as any,
  } as unknown as HttpTypes.StoreProduct,
]
