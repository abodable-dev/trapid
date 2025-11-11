export default function BrutalButton({ children, variant = 'default', size = 'md', onClick, className = '', ...props }) {
  const sizeClasses = {
    sm: 'px-6 py-0.5 text-xs',
    md: 'px-8 py-0.5 text-sm',
    lg: 'px-10 py-1 text-base',
  }

  const variantClasses = {
    default: 'bg-white text-black border-white',
    outline: 'bg-transparent text-white border-white',
  }

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        border-2 uppercase font-medium
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        transition-all duration-200
        shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255)]
        translate-x-[3px] translate-y-[3px]
        hover:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]
        hover:translate-x-0 hover:translate-y-0
        active:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255),6px_6px_0px_0px_rgba(255,255,255),7px_7px_0px_0px_rgba(255,255,255)]
        active:-translate-x-[2px] active:-translate-y-[2px]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
