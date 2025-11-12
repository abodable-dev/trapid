import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      navigate(`/login?error=${error}`)
      return
    }

    if (token && userParam) {
      // Store the token
      localStorage.setItem('token', token)

      // Parse and store the user
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        setUser(user)
        navigate('/dashboard')
      } catch (err) {
        console.error('Failed to parse user data:', err)
        navigate('/login?error=invalid_user_data')
      }
    } else {
      navigate('/login?error=missing_credentials')
    }
  }, [searchParams, navigate, setUser])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  )
}
