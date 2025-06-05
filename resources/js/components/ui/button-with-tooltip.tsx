"use client"

import * as React from "react"
import { Button, type ButtonProps } from "./button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ButtonWithTooltipProps extends ButtonProps {
  tooltip?: string
  tooltipSide?: "top" | "right" | "bottom" | "left"
  tooltipAlign?: "start" | "center" | "end"
}

const ButtonWithTooltip = React.forwardRef<
  HTMLButtonElement,
  ButtonWithTooltipProps
>(
  (
    {
      tooltip,
      tooltipSide = "top",
      tooltipAlign = "center",
      children,
      ...props
    },
    ref
  ) => {
    if (!tooltip) {
      return (
        <Button ref={ref} {...props}>
          {children}
        </Button>
      )
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} asChild {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} align={tooltipAlign}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }
)

ButtonWithTooltip.displayName = "ButtonWithTooltip"

export { ButtonWithTooltip }
