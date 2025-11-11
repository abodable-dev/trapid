import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import packageJson from '../../../package.json'
import {
 Dialog,
 DialogBackdrop,
 DialogPanel,
 TransitionChild,
 Menu,
 MenuButton,
 MenuItems,
 MenuItem,
} from '@headlessui/react'
import {
 Menu as MenuIcon,
 Bell,
 Settings,
 Home,
 Upload,
 X,
 User,
 LogOut,
 ChevronLeft,
 ChevronRight,
 ChevronDown,
 Briefcase,
 BookOpen,
 Users,
} from 'lucide-react'
import TrapidLogo from '../icons/TrapidLogo'

// Main navigation items
const navigation = [
 { name: 'Dashboard', href: '/dashboard', icon: Home },
 { name: 'Active Jobs', href: '/active-jobs', icon: Briefcase },
 { name: 'Price Books', href: '/price-books', icon: BookOpen },
 { name: 'Contacts', href: '/contacts', icon: Users },
]

// Bottom navigation items
const bottomNavigation = [
 { name: 'Import Data', href: '/import', icon: Upload },
 { name: 'Settings', href: '/settings', icon: Settings },
]

const userNavigation = [
 { name: 'Your profile', href: '/profile', icon: User },
 { name: 'Settings', href: '/settings', icon: Settings },
 { name: 'Sign out', href: '/logout', icon: LogOut },
]

function classNames(...classes) {
 return classes.filter(Boolean).join(' ')
}

export default function AppLayout({ children }) {
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
 const [backendVersion, setBackendVersion] = useState('loading...')
 const frontendVersion = packageJson.version
 const location = useLocation()

 useEffect(() => {
 const fetchVersion = async () => {
 try {
 const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/version`)
 setBackendVersion(response.data.version)
 } catch (error) {
 console.error('Failed to fetch version:', error)
 setBackendVersion('unknown')
 }
 }
 fetchVersion()
 }, [])

 const isCurrentPath = (href) => {
 if (href === '/dashboard') {
 return location.pathname === '/dashboard' || location.pathname.startsWith('/tables/')
 }
 return location.pathname === href || location.pathname.startsWith(href + '/')
 }

 return (
 <div>
 {/* Mobile sidebar */}
 <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden no-print">
 <DialogBackdrop
 transition
 className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
 />

 <div className="fixed inset-0 flex">
 <DialogPanel
 transition
 className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
 >
 <TransitionChild>
 <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
 <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
 <span className="sr-only">Close sidebar</span>
 <X className="w-5 h-5 text-white" />
 </button>
 </div>
 </TransitionChild>

 {/* Mobile Sidebar content */}
 <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-black border-r border-gray-800 px-6 pb-4">
 <div className="relative flex h-12 shrink-0 items-center border-b border-gray-800">
 <TrapidLogo className="h-6 w-6 text-white" />
 <span className="ml-2 text-sm font-semibold text-white">Trapid</span>
 </div>
 <nav className="relative flex flex-1 flex-col">
 <ul role="list" className="flex flex-1 flex-col gap-y-7">
 <li>
 <ul role="list" className="space-y-1">
 {navigation.map((item) => {
 const current = isCurrentPath(item.href)
 return (
 <li key={item.name}>
 <Link
 to={item.href}
 onClick={() => setSidebarOpen(false)}
 className={classNames(
 current
 ? 'bg-gray-900 text-white'
 : 'text-gray-400 hover:text-white hover:bg-gray-900/50',
 'group flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
 )}
 >
 <item.icon
 aria-hidden="true"
 className="w-[15px] h-[15px] shrink-0"
 />
 {item.name}
 </Link>
 </li>
 )
 })}
 </ul>
 </li>
 <li className="mt-auto">
 <div className="border-t border-gray-800 pt-4">
 <ul role="list" className="space-y-1">
 {bottomNavigation.map((item) => {
 const current = isCurrentPath(item.href)
 return (
 <li key={item.name}>
 <Link
 to={item.href}
 onClick={() => setSidebarOpen(false)}
 className={classNames(
 current
 ? 'bg-gray-900 text-white'
 : 'text-gray-400 hover:text-white hover:bg-gray-900/50',
 'group flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
 )}
 >
 <item.icon
 aria-hidden="true"
 className="h-[15px] w-[15px] shrink-0"
 />
 {item.name}
 </Link>
 </li>
 )
 })}
 </ul>
 <div className="mt-4 px-3 space-y-1">
 <p className="text-xs text-gray-500 font-medium">
 Frontend v{frontendVersion}
 </p>
 <p className="text-xs text-gray-500 font-medium">
 Backend {backendVersion}
 </p>
 </div>
 </div>
 </li>
 </ul>
 </nav>
 </div>
 </DialogPanel>
 </div>
 </Dialog>

 {/* Static sidebar for desktop */}
 <div className={classNames(
"hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-200 no-print",
 sidebarCollapsed ?"lg:w-16" :"lg:w-64"
 )}>
 <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-800 bg-black pb-4">
 <div className={classNames(
"flex h-12 shrink-0 items-center relative border-b border-gray-800",
 sidebarCollapsed ?"justify-center px-2" :"px-3"
 )}>
 {!sidebarCollapsed && (
 <>
 <TrapidLogo className="h-6 w-6 text-white" />
 <span className="ml-2 text-sm font-semibold text-white">Trapid</span>
 </>
 )}
 {sidebarCollapsed && (
 <TrapidLogo className="h-6 w-6 text-white" />
 )}
 <button
 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
 className={classNames(
"absolute p-1 transition-all duration-200",
"hover:bg-gray-900/50 text-gray-400 hover:text-gray-200",
 sidebarCollapsed ?"-right-3 top-1/2 -translate-y-1/2" :"right-2 top-1/2 -translate-y-1/2"
 )}
 title={sidebarCollapsed ?"Expand sidebar" :"Collapse sidebar"}
 >
 {sidebarCollapsed ? (
 <ChevronRight className="w-3.5 h-3.5" />
 ) : (
 <ChevronLeft className="w-3.5 h-3.5" />
 )}
 </button>
 </div>
 <nav className={classNames("flex flex-1 flex-col", sidebarCollapsed ?"px-2" :"px-2")}>
 <ul role="list" className="flex flex-1 flex-col gap-y-5">
 <li>
 <ul role="list" className="space-y-1">
 {navigation.map((item) => {
 const current = isCurrentPath(item.href)
 return (
 <li key={item.name}>
 <Link
 to={item.href}
 title={sidebarCollapsed ? item.name : undefined}
 className={classNames(
 current
 ? 'bg-gray-900 text-white'
 : 'text-gray-400 hover:text-white hover:bg-gray-900/50',
 'group flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
 sidebarCollapsed && 'justify-center px-2'
 )}
 >
 <item.icon
 aria-hidden="true"
 className="h-[15px] w-[15px] shrink-0"
 />
 {!sidebarCollapsed && item.name}
 </Link>
 </li>
 )
 })}
 </ul>
 </li>
 <li className="mt-auto">
 <div className="border-t border-gray-800 pt-4">
 <ul role="list" className="space-y-1">
 {bottomNavigation.map((item) => {
 const current = isCurrentPath(item.href)
 return (
 <li key={item.name}>
 <Link
 to={item.href}
 title={sidebarCollapsed ? item.name : undefined}
 className={classNames(
 current
 ? 'bg-gray-900 text-white'
 : 'text-gray-400 hover:text-white hover:bg-gray-900/50',
 'group flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
 sidebarCollapsed && 'justify-center px-2'
 )}
 >
 <item.icon
 aria-hidden="true"
 className="h-[15px] w-[15px] shrink-0"
 />
 {!sidebarCollapsed && item.name}
 </Link>
 </li>
 )
 })}
 </ul>
 {!sidebarCollapsed && (
 <div className="mt-4 px-3 space-y-1">
 <p className="text-xs text-gray-500 font-medium">
 Frontend v{frontendVersion}
 </p>
 <p className="text-xs text-gray-500 font-medium">
 Backend {backendVersion}
 </p>
 </div>
 )}
 </div>
 </li>
 </ul>
 </nav>
 </div>
 </div>

 {/* Main content area */}
 <div className={classNames(
"transition-all duration-200 bg-black min-h-screen",
 sidebarCollapsed ?"lg:pl-16" :"lg:pl-64"
 )}>
 {/* Top bar */}
 <div className="sticky top-0 z-40 flex h-10 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-black px-3 sm:gap-x-4 sm:px-4 lg:px-6 no-print">
 <button
 type="button"
 onClick={() => setSidebarOpen(true)}
 className="-m-2.5 p-2.5 text-gray-400 hover:text-white transition-colors duration-200 lg:hidden"
 >
 <span className="sr-only">Open sidebar</span>
 <MenuIcon aria-hidden="true" className="w-5 h-5" />
 </button>

 {/* Separator */}
 <div aria-hidden="true" className="h-6 w-px bg-gray-800 lg:hidden" />

 <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
 <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
 <button type="button" className="-m-1.5 p-1.5 text-gray-400 hover:text-white transition-colors duration-200">
 <span className="sr-only">View notifications</span>
 <Bell className="w-[15px] h-[15px]" />
 </button>

 </div>
          {/* Profile dropdown - Subframe-inspired design with Headless UI */}
          <Menu as="div" className="relative">
            <MenuButton className="relative flex items-center gap-2 px-2 py-1 hover:bg-gray-900/50 transition-colors outline-none">
              <span className="sr-only">Open user menu</span>
              <img
                alt="User profile"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="h-6 w-6 rounded-full ring-1 ring-gray-800"
              />
              <span className="hidden lg:flex lg:items-center">
                <span aria-hidden="true" className="text-xs font-medium text-white">
                  User
                </span>
                <ChevronDown className="ml-1 w-3.5 h-3.5 text-gray-400" />
              </span>
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-50 mt-1 min-w-[192px] origin-top-right rounded-none bg-gray-900 border border-gray-800 p-1 shadow-lg focus:outline-none transition duration-150 ease-out data-[closed]:opacity-0"
            >
              <MenuItem>
                {({ focus }) => (
                  <Link
                    to="/profile"
                    className={classNames(
                      focus ? 'bg-gray-800 text-white' : 'text-gray-300',
                      'flex items-center gap-2 rounded-none h-8 px-3 text-sm outline-none cursor-pointer transition-colors duration-200'
                    )}
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    Your profile
                  </Link>
                )}
              </MenuItem>

              <MenuItem>
                {({ focus }) => (
                  <Link
                    to="/settings"
                    className={classNames(
                      focus ? 'bg-gray-800 text-white' : 'text-gray-300',
                      'flex items-center gap-2 rounded-none h-8 px-3 text-sm outline-none cursor-pointer transition-colors duration-200'
                    )}
                  >
                    <Settings className="w-4 h-4" aria-hidden="true" />
                    Settings
                  </Link>
                )}
              </MenuItem>

              <div className="h-px bg-gray-800 my-1" />

              <MenuItem>
                {({ focus }) => (
                  <Link
                    to="/logout"
                    className={classNames(
                      focus ? 'bg-gray-800 text-white' : 'text-gray-300',
                      'flex items-center gap-2 rounded-none h-8 px-3 text-sm outline-none cursor-pointer transition-colors duration-200'
                    )}
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Sign out
                  </Link>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
 </div>
 </div>

 {/* Main content */}
 <main>
 {children}
 </main>
 </div>
 </div>
 )
}
