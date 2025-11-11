import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import packageJson from '../../../package.json'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  BookOpenIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

// Main navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Active Jobs', href: '/active-jobs', icon: BriefcaseIcon },
  { name: 'Price Books', href: '/price-books', icon: BookOpenIcon },
  { name: 'Contacts', href: '/contacts', icon: UsersIcon },
]

// Bottom navigation items
const bottomNavigation = [
  { name: 'Import Data', href: '/import', icon: ArrowUpTrayIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

const userNavigation = [
  { name: 'Your profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Sign out', href: '/logout', icon: ArrowRightOnRectangleIcon },
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
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
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
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>

            {/* Mobile Sidebar content */}
            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-black border-r border-gray-800 px-6 pb-4">
              <div className="relative flex h-12 shrink-0 items-center border-b border-gray-800">
                <img
                  alt="Trapid"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-6 w-auto"
                />
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
                                'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0"
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
                                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                                )}
                              >
                                <item.icon
                                  aria-hidden="true"
                                  className="h-4 w-4 shrink-0"
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
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-200",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-800 bg-black pb-4">
          <div className={classNames(
            "flex h-12 shrink-0 items-center relative border-b border-gray-800",
            sidebarCollapsed ? "justify-center px-2" : "px-3"
          )}>
            {!sidebarCollapsed && (
              <>
                <img
                  alt="Trapid"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-6 w-auto"
                />
                <span className="ml-2 text-sm font-semibold text-white">Trapid</span>
              </>
            )}
            {sidebarCollapsed && (
              <img
                alt="Trapid"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-6 w-auto"
              />
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={classNames(
                "absolute p-1 rounded-md transition-all duration-200",
                "hover:bg-gray-900/50 text-gray-400 hover:text-gray-200",
                sidebarCollapsed ? "-right-3 top-1/2 -translate-y-1/2" : "right-2 top-1/2 -translate-y-1/2"
              )}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <nav className={classNames("flex flex-1 flex-col", sidebarCollapsed ? "px-2" : "px-2")}>
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
                            'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                            sidebarCollapsed && 'justify-center px-2'
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0"
                          />
                          {!sidebarCollapsed && item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className={classNames(
                  "border-t border-gray-800 pt-4",
                  sidebarCollapsed ? "" : ""
                )}>
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
                              'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
                              sidebarCollapsed && 'justify-center px-2'
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0"
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
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-10 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-black px-3 sm:gap-x-4 sm:px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-400 hover:text-white transition-colors duration-200 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div aria-hidden="true" className="h-6 w-px bg-gray-800 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-1.5 p-1.5 text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="h-5 w-5" />
              </button>

              {/* Separator */}
              <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-800" />

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <MenuButton className="relative flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-900/50 transition-all duration-200">
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="h-7 w-7 rounded-full ring-1 ring-gray-800"
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span aria-hidden="true" className="text-xs font-medium text-white">
                      User
                    </span>
                    <ChevronDownIcon aria-hidden="true" className="ml-1 h-4 w-4 text-gray-400" />
                  </span>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-gray-900 border border-gray-800 shadow-xl transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in overflow-hidden"
                >
                  <div className="py-1">
                    <MenuItem>
                      <Link
                        to="/profile"
                        className="group flex items-center px-4 py-2.5 text-sm text-gray-300 data-[focus]:bg-gray-800 data-[focus]:text-white transition-colors duration-200"
                      >
                        <UserCircleIcon
                          aria-hidden="true"
                          className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-white"
                        />
                        Your profile
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        to="/settings"
                        className="group flex items-center px-4 py-2.5 text-sm text-gray-300 data-[focus]:bg-gray-800 data-[focus]:text-white transition-colors duration-200"
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-white"
                        />
                        Settings
                      </Link>
                    </MenuItem>
                  </div>
                  <div className="border-t border-gray-800 py-1">
                    <MenuItem>
                      <Link
                        to="/logout"
                        className="group flex items-center px-4 py-2.5 text-sm text-gray-300 data-[focus]:bg-gray-800 data-[focus]:text-white transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon
                          aria-hidden="true"
                          className="mr-3 h-5 w-5 text-gray-400 group-data-[focus]:text-white"
                        />
                        Sign out
                      </Link>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </div>
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
