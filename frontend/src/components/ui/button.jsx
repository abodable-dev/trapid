import * as React from"react"
import { Slot } from"@radix-ui/react-slot"
import { cva } from"class-variance-authority"
import { cn } from"@/lib/utils"

const buttonVariants = cva(
"inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50",
 {
 variants: {
 variant: {
 default:
"text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100",
 destructive:
"bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
 outline:
"border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900",
 ghost:
"hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300",
 link:
"text-gray-700 dark:text-gray-300 underline-offset-4 hover:underline",
 primary:
"text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100",
 },
 size: {
 default:"px-3 py-1.5",
 sm:"px-2.5 py-1",
 lg:"px-4 py-2",
 icon:"h-7 w-7",
 },
 },
 defaultVariants: {
 variant:"default",
 size:"default",
 },
 }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot :"button"
 return (
 <Comp
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 {...props}
 />
 )
})
Button.displayName ="Button"

export { Button, buttonVariants }
