import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const baseStyles = 'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground';

const variantStyles: Record<string, string> = {
  default: 'bg-background text-foreground border-border',
  info: 'bg-blue-50 text-blue-900 border-blue-200 [&>svg]:text-blue-600 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800',
  success: 'bg-green-50 text-green-900 border-green-200 [&>svg]:text-green-600 dark:bg-green-950 dark:text-green-100 dark:border-green-800',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 [&>svg]:text-yellow-600 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800',
  destructive: 'bg-red-50 text-red-900 border-red-200 [&>svg]:text-red-600 dark:bg-red-950 dark:text-red-100 dark:border-red-800',
};

export function alertVariants({
  variant = 'default',
  className = '',
}: { variant?: string; className?: string } = {}) {
  return cn(baseStyles, variantStyles[variant] || variantStyles.default, className);
}

const iconMap: Record<string, typeof Info> = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles;
  title?: string;
  onClose?: () => void;
}

export function Alert({
  className,
  variant = 'default',
  title,
  children,
  onClose,
  ...props
}: AlertProps) {
  const Icon = iconMap[variant || 'default'];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        {title && <h5 className="mb-1 font-medium leading-none">{title}</h5>}
        <div className="text-sm [&_p]:leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}
