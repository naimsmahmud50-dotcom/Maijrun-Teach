import { EllipseMiniSolid } from "@medusajs/icons"
import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex gap-x-3 flex-col gap-y-2.5">
      <Text className="txt-compact-small-plus text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        {title}
      </Text>
      <RadioGroup data-testid={dataTestId} onValueChange={handleChange} className="space-y-1">
        {items?.map((i) => (
          <div
            key={i.value}
            className={clx("flex gap-x-2 items-center py-0.5", {
              "ml-[-23px]": i.value === value,
            })}
          >
            {i.value === value && <EllipseMiniSolid className="text-cyan-400 shrink-0" />}
            <RadioGroup.Item
              checked={i.value === value}
              className="hidden peer"
              id={i.value}
              value={i.value}
            />
            <Label
              htmlFor={i.value}
              className={clx(
                "!txt-compact-small !transform-none text-slate-300 hover:text-white hover:cursor-pointer transition-colors duration-150 font-normal",
                {
                  "!text-white !font-bold": i.value === value,
                }
              )}
              data-testid="radio-label"
              data-active={i.value === value}
            >
              {i.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
