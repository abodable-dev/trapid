import * as React from"react"
import { cva } from"class-variance-authority"
import { cn } from"@/lib/utils"

/**
 * Badge Component - Midday.ai Style
 *
 * A reusable badge component with transparent backgrounds and colored borders.
 * Follows the Midday.ai design pattern with subtle, minimal styling.
 *
 * Usage:
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error">Failed</Badge>
 * <Badge variant="warning">Pending</Badge>
 */

const badgeVariants = cva(
"inline-flex items-center border px-2 py-1 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black",
 {
 variants: {
 variant: {
 default:
"border-border bg-gray-900/50 text-foreground-secondary",
 success:
"border-success/20 bg-success/10 text-success",
 warning:
"border-warning/20 bg-warning/10 text-warning",
 error:
"border-error/20 bg-error/10 text-error",
 info:
"border-info/20 bg-info/10 text-info",
 outline:
"border-border text-foreground",
 // Legacy color mappings for backwards compatibility
 gray:"border-border bg-gray-900/50 text-foreground-secondary",
 green:"border-success/20 bg-success/10 text-success",
 red:"border-error/20 bg-error/10 text-error",
 yellow:"border-warning/20 bg-warning/10 text-warning",
 blue:"border-info/20 bg-info/10 text-info",
 indigo:"border-info/20 bg-info/10 text-info",
 purple:"border-[#A855F7]/20 bg-[#A855F7]/10 text-[#A855F7]",
 pink:"border-[#EC4899]/20 bg-[#EC4899]/10 text-[#EC4899]",
 },
 },
 defaultVariants: {
 variant:"default",
 },
 }
)

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
 return (
 <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
 )
})
Badge.displayName ="Badge"

export { Badge, badgeVariants }
