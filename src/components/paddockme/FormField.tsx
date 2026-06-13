import { cn } from "@/lib/utils";

/**
 * Labelled form field with consistent PaddockME styling.
 * Pass `as="textarea"` for multi-line input.
 */
export function FormField({
  label,
  hint,
  as = "input",
  className,
  id,
  ...rest
}: {
  label: string;
  hint?: string;
  as?: "input" | "textarea";
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldId =
    id ?? `pm-field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const inputCls =
    "w-full rounded-lg border border-pm-border bg-white px-4 py-3 text-sm text-pm-charcoal placeholder:text-pm-muted/70 focus:border-pm-green-700 focus:outline-none focus:ring-2 focus:ring-pm-green-700/20";
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-semibold text-pm-charcoal"
      >
        {label}
        {hint && (
          <span className="ml-1 font-normal text-pm-muted">({hint})</span>
        )}
      </label>
      {as === "textarea" ? (
        <textarea id={fieldId} rows={3} className={inputCls} {...rest} />
      ) : (
        <input id={fieldId} className={inputCls} {...rest} />
      )}
    </div>
  );
}
