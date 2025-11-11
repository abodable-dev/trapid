import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Logout() {
 const navigate = useNavigate()
 const { logout } = useAuth()

 useEffect(() => {
 const performLogout = async () => {
 await logout()
 navigate('/login')
 }
 performLogout()
 }, [logout, navigate])

 return (
 <div className="flex items-center justify-center min-h-screen">
 <div className="text-center">
 <span className="loading loading-infinity loading-lg"></span>
 <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Signing out...</p>
 </div>
 </div>
 )
}
