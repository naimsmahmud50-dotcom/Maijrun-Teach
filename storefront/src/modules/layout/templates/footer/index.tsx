import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"
import { brandConfig } from "@config/brand"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BrandCTA from "@modules/layout/components/brand-cta"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-ui-border-base w-full bg-slate-950/40">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-24 sm:py-32">
          <div className="flex flex-col gap-y-3 max-w-sm">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <img
                src={brandConfig.logo.src}
                alt={brandConfig.name}
                className="h-8 w-auto object-contain"
              />
            </LocalizedClientLink>
            <p className="text-small-regular text-slate-300">
              {brandConfig.description}
            </p>
            <p className="text-xsmall-regular text-slate-400">
              Email: {brandConfig.supportEmail} | {brandConfig.location}
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-white font-bold">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-slate-300 txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-cyan-400 transition-colors",
                            children && "txt-small-plus text-slate-200"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-cyan-400 transition-colors"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-white font-bold">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-slate-300 txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-cyan-400 transition-colors"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-white font-bold">About {brandConfig.name}</span>
              <ul className="grid grid-cols-1 gap-y-2 text-slate-300 txt-small">
                <li>
                  <LocalizedClientLink
                    href="/about"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    About Us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/warranty"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Warranty Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <a
                    href={brandConfig.socials.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Facebook Page
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${brandConfig.supportEmail}`}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-slate-400">
          <Text className="txt-compact-small text-slate-400">
            {brandConfig.footer.copyright}
          </Text>
          <BrandCTA />
        </div>
      </div>
    </footer>
  )
}
