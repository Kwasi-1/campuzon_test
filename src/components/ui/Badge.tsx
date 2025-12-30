import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';

const variantStyles: Record<string, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-red-500 text-white',
  outline: 'border border-border text-foreground',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-500 text-white',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles;
}

export function badgeVariants({
  variant = 'default',
  className = '',
}: { variant?: string; className?: string } = {}) {
  return cn(baseStyles, variantStyles[variant] || variantStyles.default, className);
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={badgeVariants({ variant, className })}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
