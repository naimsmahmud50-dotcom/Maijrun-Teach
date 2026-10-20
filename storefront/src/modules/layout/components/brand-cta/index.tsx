import { Text } from "@medusajs/ui"
import { brandConfig } from "@config/brand"

const BrandCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center text-ui-fg-subtle">
      <span>{brandConfig.tagline}</span>
    </Text>
  )
}

export default BrandCTA
