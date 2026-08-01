"use client"

import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cn } from "@/lib/utils"

const NavigationMenu = NavigationMenuPrimitive.Root
const NavigationMenuList = NavigationMenuPrimitive.List
const NavigationMenuItem = NavigationMenuPrimitive.Item
const NavigationMenuTrigger = NavigationMenuPrimitive.Trigger
const NavigationMenuContent = NavigationMenuPrimitive.Content

const NavigationMenuLink = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & {
  isActive?: boolean
}) => {
  return (
    <a
      className={cn(
        "block select-none space-y-1 rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[active]:bg-accent data-[state=open]:bg-accent",
        className
      )}
      {...props}
    >
      <div className="text-sm font-semibold leading-none">
        {children}
      </div>
    </a>
  )
}

NavigationMenuLink.displayName = NavigationMenuPrimitive.Trigger.displayName

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
}