import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import packageJson from '../../../package.json'
import BackButton from '../common/BackButton'
import FloatingHelpButton from '../FloatingHelpButton'
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
  CpuChipIcon,
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
  PlusIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CloudIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  BanknotesIcon,
  ChartBarIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

// Main navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Active Jobs', href: '/active-jobs', icon: BriefcaseIcon },
  { name: 'Xest', href: '/xest', icon: BeakerIcon },
  { name: 'Price Books', href: '/price-books', icon: BookOpenIcon },
  { name: 'Contacts', href: '/contacts', icon: UsersIcon },
  { name: 'Accounts', href: '/accounts', icon: BanknotesIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Training', href: '/training', icon: AcademicCapIcon },
  { name: 'Outlook', href: '/outlook', icon: EnvelopeIcon },
  { name: 'OneDrive', href: '/onedrive', icon: CloudIcon },
  { name: 'Health', href: '/health', icon: PlusIcon },
  { name: 'Performance', href: '/system/performance', icon: CpuChipIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'The Bible', href: '/documentation', icon: BookOpenIcon },
  { name: 'DHTMLX Gantt', href: '/settings?tab=schedule-master&openGantt=dhtmlx', icon: ChartBarIcon },
]

// Bottom navigation items
const bottomNavigation = [
  { name: 'Import Data', href: '/import', icon: ArrowUpTrayIcon },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AppLayout({ children }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    location.pathname === '/active-jobs' || location.pathname.startsWith('/jobs/') || location.pathname === '/settings'
  )
  const [backendVersion, setBackendVersion] = useState('loading...')
  const [unreadCount, setUnreadCount] = useState(0)
  const frontendVersion = packageJson.version

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

  // Poll for unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/chat_messages/unread_count`, {
          withCredentials: true
        })
        setUnreadCount(response.data.count || 0)
      } catch {
        // Silently fail - unread count is not critical
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Auto-collapse sidebar when navigating to Active Jobs, Job Detail pages, or Settings
  useEffect(() => {
    if (location.pathname === '/active-jobs' || location.pathname.startsWith('/jobs/') || location.pathname === '/settings') {
      setSidebarCollapsed(true)
    }
  }, [location.pathname])

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
            <div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 dark:bg-gray-900 dark:ring dark:ring-white/10 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10">
              <div className="relative flex h-16 shrink-0 items-center">
                <img
                  alt="Trapid"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto dark:hidden"
                />
                <img
                  alt="Trapid"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="hidden h-8 w-auto dark:block"
                />
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Trapid</span>
              </div>
              <nav className="relative flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const current = isCurrentPath(item.href)
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={classNames(
                                current
                                  ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  current
                                    ? 'text-indigo-600 dark:text-white'
                                    : 'text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white',
                                  'size-6 shrink-0',
                                )}
                              />
                              {item.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                  <li className="mt-auto">
                    <ul role="list" className="-mx-2 space-y-1">
                      {bottomNavigation.map((item) => {
                        const current = isCurrentPath(item.href)
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={classNames(
                                current
                                  ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                              )}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  current
                                    ? 'text-indigo-600 dark:text-white'
                                    : 'text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white',
                                  'size-6 shrink-0',
                                )}
                              />
                              {item.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="px-2 pt-2">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Frontend: v{frontendVersion}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Backend: {backendVersion}
                      </p>
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
        "hidden bg-gray-900 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
        sidebarCollapsed ? "lg:w-16" : "lg:w-72"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white pb-4 dark:border-white/10 dark:bg-black/10">
          <div className={classNames(
            "flex h-16 shrink-0 items-center relative",
            sidebarCollapsed ? "justify-center px-2" : "px-6"
          )}>
            {!sidebarCollapsed && (
              <>
                <img
                  alt="Trapid"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto dark:hidden"
                />
                <img
                  alt="Trapid"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="hidden h-8 w-auto dark:block"
                />
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Trapid</span>
              </>
            )}
            {sidebarCollapsed && (
              <img
                alt="Trapid"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto dark:hidden"
              />
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={classNames(
                "absolute p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
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
          <nav className={classNames("flex flex-1 flex-col", sidebarCollapsed ? "px-2" : "px-6")}>
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const current = isCurrentPath(item.href)
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          title={sidebarCollapsed ? item.name : undefined}
                          className={classNames(
                            current
                              ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                            sidebarCollapsed && 'justify-center'
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              current
                                ? 'text-indigo-600 dark:text-white'
                                : 'text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white',
                              'size-6 shrink-0',
                            )}
                          />
                          {!sidebarCollapsed && item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <ul role="list" className="-mx-2 space-y-1">
                  {bottomNavigation.map((item) => {
                    const current = isCurrentPath(item.href)
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          title={sidebarCollapsed ? item.name : undefined}
                          className={classNames(
                            current
                              ? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                            sidebarCollapsed && 'justify-center'
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              current
                                ? 'text-indigo-600 dark:text-white'
                                : 'text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white',
                              'size-6 shrink-0',
                            )}
                          />
                          {!sidebarCollapsed && item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                {!sidebarCollapsed && (
                  <div className="px-2 pt-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Frontend: v{frontendVersion}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Backend: {backendVersion}
                    </p>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className={classNames(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-72"
      )}>
        {/* Top bar - hidden when sidebar is collapsed on desktop */}
        <div className={classNames(
          "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-white/10 dark:bg-gray-900 dark:shadow-none transition-all duration-300",
          sidebarCollapsed ? "lg:hidden" : ""
        )}>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:text-white"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>

          {/* Separator */}
          <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden dark:bg-white/10" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
              {/* Chat Icon */}
              <Link to="/chat" className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-white">
                <span className="sr-only">Chat</span>
                <ChatBubbleLeftRightIcon aria-hidden="true" className="size-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Training Icon */}
              <Link to="/training" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-white" title="Training Sessions">
                <span className="sr-only">Training Sessions</span>
                <AcademicCapIcon aria-hidden="true" className="size-6" />
              </Link>

              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-white">
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="size-6" />
              </button>

              {/* Separator */}
              <div aria-hidden="true" className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-white/10" />

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <MenuButton className="relative flex items-center">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="size-8 rounded-full bg-gray-50 outline outline-1 -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span aria-hidden="true" className="ml-4 text-sm/6 font-semibold text-gray-900 dark:text-white">
                      User
                    </span>
                    <ChevronDownIcon aria-hidden="true" className="ml-2 size-5 text-gray-400 dark:text-gray-500" />
                  </span>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg outline outline-1 outline-black/5 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in dark:divide-white/10 dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                >
                  <div className="py-1">
                    <MenuItem>
                      <Link
                        to="/profile"
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none dark:text-gray-300 dark:data-[focus]:bg-white/5 dark:data-[focus]:text-white"
                      >
                        <UserCircleIcon
                          aria-hidden="true"
                          className="mr-3 size-5 text-gray-400 group-data-[focus]:text-gray-500 dark:text-gray-500 dark:group-data-[focus]:text-white"
                        />
                        Your profile
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        to="/settings"
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none dark:text-gray-300 dark:data-[focus]:bg-white/5 dark:data-[focus]:text-white"
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="mr-3 size-5 text-gray-400 group-data-[focus]:text-gray-500 dark:text-gray-500 dark:group-data-[focus]:text-white"
                        />
                        Settings
                      </Link>
                    </MenuItem>
                  </div>
                  <div className="py-1">
                    <MenuItem>
                      <Link
                        to="/logout"
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none dark:text-gray-300 dark:data-[focus]:bg-white/5 dark:data-[focus]:text-white"
                      >
                        <ArrowRightOnRectangleIcon
                          aria-hidden="true"
                          className="mr-3 size-5 text-gray-400 group-data-[focus]:text-gray-500 dark:text-gray-500 dark:group-data-[focus]:text-white"
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
        <main className={classNames(
          "py-10",
          sidebarCollapsed ? "lg:pt-10" : ""
        )}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-4">
              <BackButton />
            </div>
            {children}
          </div>
        </main>

        {/* Floating Help Button */}
        <FloatingHelpButton />
      </div>
    </div>
  )
}
