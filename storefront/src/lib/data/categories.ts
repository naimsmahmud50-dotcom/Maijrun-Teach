import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const DEMO_CATEGORIES: HttpTypes.StoreProductCategory[] = [
  {
    id: "cat_laptops",
    name: "Laptops",
    handle: "laptops",
    description: "Premium Apple MacBooks and pro performance gaming laptops.",
    category_children: [],
  } as any,
  {
    id: "cat_phones",
    name: "Smartphones",
    handle: "smartphones",
    description: "Next-gen flagship smartphones featuring Apple A18 Pro, Snapdragon 8 Elite, and AI foldables.",
    category_children: [],
  } as any,
  {
    id: "cat_desktops",
    name: "Desktops",
    handle: "desktops",
    description: "Extreme custom liquid-cooled PC battlestations, Mac Studio M2 Ultra, and Mac mini.",
    category_children: [],
  } as any,
  {
    id: "cat_tablets",
    name: "Tablets",
    handle: "tablets",
    description: "Ultra-thin Tandem OLED iPad Pro and creative tablet hardware.",
    category_children: [],
  } as any,
  {
    id: "cat_audio",
    name: "Audio",
    handle: "audio",
    description: "Audiophile studio noise-canceling headphones, Bose Ultra, and Sony LDAC wireless audio.",
    category_children: [],
  } as any,
  {
    id: "cat_accessories",
    name: "Accessories",
    handle: "accessories",
    description: "Apple Watch Ultra 2 Titanium, mechanical keyboards, and precision peripherals.",
    category_children: [],
  } as any,
  {
    id: "cat_components",
    name: "Components",
    handle: "components",
    description: "4K 240Hz QD-OLED gaming displays and extreme workstation components.",
    category_children: [],
  } as any,
]

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories?.length ? product_categories : DEMO_CATEGORIES)
    .catch(() => DEMO_CATEGORIES)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories?.[0] || DEMO_CATEGORIES.find((c) => c.handle === handle) || null)
    .catch(() => DEMO_CATEGORIES.find((c) => c.handle === handle) || null)
}
