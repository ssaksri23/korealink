import * as React from "react";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  label,
  ...props
}: React.ComponentProps<"input"> & { label?: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        className={cn(
          "size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500",
          className,
        )}
        {...props}
      />
      {label}
    </label>
  );
}
