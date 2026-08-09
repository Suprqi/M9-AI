import * as React from "react";

import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-line-strong bg-ink-900/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-brand-500 focus:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-60";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClass, "h-11", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldClass, "min-h-28 resize-y leading-7", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(fieldClass, "h-11 cursor-pointer appearance-none pe-10", className)}
    {...props}
  />
));
Select.displayName = "Select";

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn("block text-sm font-medium text-slate-300", className)}
      {...props}
    >
      {children}
      {required ? <span className="ms-1 text-mint-400">*</span> : null}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-400">{message}</p>;
}
