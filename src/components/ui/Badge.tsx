import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-surface-700 text-surface-200',
        primary: 'bg-primary-900 text-primary-300',
        success: 'bg-emerald-900 text-emerald-300',
        warning: 'bg-amber-900 text-amber-300',
        danger: 'bg-red-900 text-red-300',
        purple: 'bg-purple-900 text-purple-300',
        cyan: 'bg-cyan-900 text-cyan-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
