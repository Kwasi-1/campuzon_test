import { forwardRef } from 'react';
import { cn, getInitials } from '@/lib/utils';

const baseStyles = 'relative flex shrink-0 overflow-hidden rounded-full bg-muted';

const sizeStyles: Record<string, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl',
};

export function avatarVariants({
  size = 'md',
  className = '',
}: { size?: string; className?: string } = {}) {
  return cn(baseStyles, sizeStyles[size] || sizeStyles.md, className);
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeStyles;
  src?: string | null;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', src, alt, fallback, status, ...props }, ref) => {
    const initials = fallback ? getInitials(fallback) : alt ? getInitials(alt) : '?';

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), 'relative', className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-secondary text-white font-medium">
            {initials}
          </div>
        )}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-background',
              size === 'xs' && 'h-1.5 w-1.5',
              size === 'sm' && 'h-2 w-2',
              size === 'md' && 'h-2.5 w-2.5',
              size === 'lg' && 'h-3 w-3',
              size === 'xl' && 'h-3.5 w-3.5',
              size === '2xl' && 'h-4 w-4',
              status === 'online' && 'bg-green-500',
              status === 'offline' && 'bg-gray-400',
              status === 'away' && 'bg-yellow-500',
              status === 'busy' && 'bg-red-500'
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
