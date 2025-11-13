import { useState } from 'react'

function classNames(...classes) {
 return classes.filter(Boolean).join(' ')
}

function getInitials(name) {
 if (!name) return '?'

 const parts = name.trim().split(' ')
 if (parts.length === 1) {
 return parts[0].charAt(0).toUpperCase()
 }

 return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export default function UserAvatar({
 user,
 size = 'md',
 className = ''
}) {
 const [imageError, setImageError] = useState(false)

 const sizeClasses = {
 xs: 'h-6 w-6 text-xs',
 sm: 'h-8 w-8 text-sm',
 md: 'h-10 w-10 text-base',
 lg: 'h-12 w-12 text-lg',
 xl: 'h-16 w-16 text-xl',
 }

 const name = user?.name || user?.full_name || 'Unknown'
 const photoUrl = user?.photo_url || user?.avatar_url
 const initials = getInitials(name)

 const showInitials = !photoUrl || imageError

 if (showInitials) {
 return (
 <div
 className={classNames(
 'inline-flex items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 font-medium text-white',
 sizeClasses[size],
 className
 )}
 title={name}
 >
 {initials}
 </div>
 )
 }

 return (
 <img
 src={photoUrl}
 alt={name}
 title={name}
 onError={() => setImageError(true)}
 className={classNames(
 'rounded-full object-cover',
 sizeClasses[size],
 className
 )}
 />
 )
}
