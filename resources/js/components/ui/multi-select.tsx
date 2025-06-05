// multi-select.tsx (improved implementation)
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

const MultiSelect = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Button
            variant="outline"
            role="combobox"
            type="button"
            className={cn(
              "w-full justify-between text-left font-normal",
              className,
              !selectedValues.length && "text-muted-foreground"
            )}
          >
            <div className="flex flex-wrap gap-1 overflow-hidden">
              {selectedValues.length > 0 ? (
                options
                  .filter((option) => selectedValues.includes(option.value))
                  .map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="mb-1 mr-1 truncate"
                    >
                      {option.label}
                    </Badge>
                  ))
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(
                    selectedValues.includes(option.value)
                      ? selectedValues.filter((value) => value !== option.value)
                      : [...selectedValues, option.value]
                  )
                }}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    className="mr-2"
                  />
                  <span>{option.label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }