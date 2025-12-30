import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const baseStyles = 'rounded-xl border bg-card text-card-foreground transition-all duration-200';

const variantStyles: Record<string, string> = {
  default: 'border-border shadow-sm',
  outline: 'border-border',
  ghost: 'border-transparent',
  elevated: 'border-transparent shadow-lg',
  gradient: 'border-transparent bg-gradient-to-br from-primary/5 to-secondary/5',
};

const hoverStyles: Record<string, string> = {
  none: '',
  lift: 'hover:shadow-lg hover:-translate-y-1',
  glow: 'hover:shadow-primary/20 hover:shadow-lg hover:border-primary/50',
  scale: 'hover:scale-[1.02]',
};

export function cardVariants({
  variant = 'default',
  hover = 'none',
  className = '',
}: { variant?: string; hover?: string; className?: string } = {}) {
  return cn(
    baseStyles,
    variantStyles[variant] || variantStyles.default,
    hoverStyles[hover] || hoverStyles.none,
    className
  );
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles;
  hover?: keyof typeof hoverStyles;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = 'none', ...props }, ref) => (
    <div
      ref={ref}
      className={cardVariants({ variant, hover, className })}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
