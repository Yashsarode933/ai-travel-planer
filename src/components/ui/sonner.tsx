"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "next-themes"

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "light" } = useTheme()

  return (
    <Sonner
      className="toaster"
      toastOptions={{
        classNames: {
          toast:
            "group data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          description: "group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:fade-in-0 text-muted-foreground",
          actionButton:
            "group-[.toast]:flex group-[.toast]:absolute group-[.toast]:bottom-2 group-[.toast]:right-2 group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:fade-in-0",
          cancelButton:
            "group-[.toast]:flex group-[.toast]:absolute group-[.toast]:bottom-2 group-[.toast]:right-2 group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:fade-in-0",
          title:
            "group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:fade-in-0 font-semibold",
          closeButton:
            "group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:fade-in-0",
        },
      }}
      {...props}
    />
  )
}