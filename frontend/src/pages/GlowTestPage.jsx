import { GlowingEffect } from '../components/ui/glowing-effect'

export default function GlowTestPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 gap-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Glowing Button Test</h1>
        <p className="text-gray-400">Move your cursor over the buttons to see the rainbow glow effect</p>
      </div>

      {/* Rainbow Glow Buttons */}
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Rainbow Glow Effect</h2>
        <div className="flex flex-col gap-8">
          <GlowButton>Create New Job</GlowButton>
          <GlowButton variant="outline">Import Spreadsheet</GlowButton>
          <GlowButton size="lg">Large Primary Action</GlowButton>
        </div>
      </div>

      {/* Brutal Shadow Buttons */}
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Brutal Shadow Effect</h2>
        <div className="flex flex-col gap-8">
          <BrutalButton>Create New Job</BrutalButton>
          <BrutalButton variant="outline">Import Spreadsheet</BrutalButton>
          <BrutalButton size="lg">Large Primary Action</BrutalButton>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="mt-12 p-6 border border-gray-800 max-w-md">
        <h3 className="text-white font-medium mb-4">Effect Settings</h3>
        <div className="text-sm text-gray-400 space-y-4">
          <div>
            <p className="text-white font-medium mb-1">Rainbow Glow:</p>
            <p>• Rainbow glow follows cursor movement</p>
            <p>• Smooth animated border effect</p>
          </div>
          <div>
            <p className="text-white font-medium mb-1">Brutal Shadow:</p>
            <p>• Layered shadow creates 3D depth effect</p>
            <p>• Animates on hover (reduces shadow)</p>
            <p>• Button "presses down" on click</p>
            <p>• Neubrutalism design style</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GlowButton({ children, variant = 'default', size = 'md' }) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    default: 'bg-white text-black',
    outline: 'bg-transparent text-white border border-gray-700',
  }

  return (
    <button
      className={`
        relative overflow-hidden
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-medium
        transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
      `}
    >
      {/* Rainbow Glowing Effect */}
      <GlowingEffect
        proximity={200}
        spread={30}
        borderWidth={2}
        movementDuration={0.8}
      />

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

function BrutalButton({ children, variant = 'default', size = 'md' }) {
  const sizeClasses = {
    sm: 'px-6 py-0.5 text-xs',
    md: 'px-8 py-0.5 text-sm',
    lg: 'px-10 py-1 text-base',
  }

  const variantClasses = {
    default: 'bg-white text-black border-black',
    outline: 'bg-transparent text-white border-white',
  }

  return (
    <button
      className={`
        border-2 uppercase font-medium
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        transition-all duration-200
        shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]
        hover:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255)]
        hover:translate-x-[2px] hover:translate-y-[2px]
        active:shadow-[1px_1px_rgba(255,255,255)]
        active:translate-x-[4px] active:translate-y-[4px]
      `}
    >
      {children}
    </button>
  )
}
