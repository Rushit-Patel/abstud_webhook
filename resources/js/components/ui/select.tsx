"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Root = SelectPrimitive.Root
const Group = SelectPrimitive.Group
const Value = SelectPrimitive.Value
const Trigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
Trigger.displayName = SelectPrimitive.Trigger.displayName

const Content = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      {children}
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
Content.displayName = SelectPrimitive.Content.displayName

const Item = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
Item.displayName = SelectPrimitive.Item.displayName

// High-level Select component
export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps {
    value?: string;
    onValueChange: (value: string) => void;
    options?: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
    ({ value, onValueChange, options = [], placeholder, className, disabled }, ref) => (
        <Root value={value} onValueChange={onValueChange}>
            <Trigger ref={ref} className={className} disabled={disabled}>
                <Value placeholder={placeholder}>
                    {value && options?.find(opt => opt.value === value)?.label}
                </Value>
            </Trigger>
            <Content>
                <SelectPrimitive.Viewport className="p-1">
                    {options?.map((option) => (
                        <Item key={option.value} value={option.value}>
                            {option.label}
                        </Item>
                    ))}
                    {(!options || options.length === 0) && (
                        <div className="text-sm text-muted-foreground p-2">No options available</div>
                    )}
                </SelectPrimitive.Viewport>
            </Content>
        </Root>
    )
);

Select.displayName = 'Select';

const ItemText = SelectPrimitive.ItemText;
const ItemIndicator = SelectPrimitive.ItemIndicator;
const Separator = SelectPrimitive.Separator;
const Label = SelectPrimitive.Label;
const Portal = SelectPrimitive.Portal;
const Viewport = SelectPrimitive.Viewport;
const Icon = SelectPrimitive.Icon;

// Export both high-level and primitive components
export {
    Select,
    Root as SelectRoot,
    Trigger as SelectTrigger,
    Value as SelectValue,
    Group as SelectGroup,
    Content as SelectContent,
    Item as SelectItem,
    ItemText as SelectItemText,
    ItemIndicator as SelectItemIndicator,
    Separator as SelectSeparator,
    Label as SelectLabel,
    Portal as SelectPortal,
    Viewport as SelectViewport,
    Icon as SelectIcon
}
