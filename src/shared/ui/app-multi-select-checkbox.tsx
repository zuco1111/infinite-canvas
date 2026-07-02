import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

type AppMultiSelectCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  stopPropagation?: boolean;
};

export function AppMultiSelectCheckbox({
  checked,
  onCheckedChange,
  ariaLabel,
  children,
  className,
  disabled,
  stopPropagation,
}: AppMultiSelectCheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex min-w-0 cursor-pointer items-center gap-2 text-sm text-foreground',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        className="peer sr-only"
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className="grid size-4 shrink-0 place-items-center rounded-[5px] border border-input bg-card text-transparent transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring/25 peer-disabled:cursor-not-allowed"
      >
        <Check className="size-3 stroke-[3]" />
      </span>
      {children ? <span className="min-w-0">{children}</span> : null}
    </label>
  );
}
