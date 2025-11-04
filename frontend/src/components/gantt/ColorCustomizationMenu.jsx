import { useState, Fragment } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { SwatchIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { AVAILABLE_COLORS, getUniqueStatuses, getUniqueCategories, getUniqueTypes } from './utils/colorSchemes'

/**
 * ColorCustomizationMenu - Dropdown menu for customizing Gantt colors
 */
export default function ColorCustomizationMenu({ tasks, colorConfig, onColorChange, colorBy }) {
  const [activeTab, setActiveTab] = useState('status') // 'status', 'category', or 'type'

  const statuses = getUniqueStatuses(tasks)
  const categories = getUniqueCategories(tasks)
  const types = getUniqueTypes(tasks)

  const handleColorChange = (item, colorKey) => {
    if (activeTab === 'status') {
      onColorChange({
        ...colorConfig,
        statusColors: {
          ...colorConfig.statusColors,
          [item]: colorKey,
        },
      })
    } else if (activeTab === 'category') {
      onColorChange({
        ...colorConfig,
        categoryColors: {
          ...colorConfig.categoryColors,
          [item]: colorKey,
        },
      })
    } else {
      onColorChange({
        ...colorConfig,
        typeColors: {
          ...colorConfig.typeColors,
          [item]: colorKey,
        },
      })
    }
  }

  const getCurrentColor = (item) => {
    if (activeTab === 'status') {
      return colorConfig.statusColors[item] || 'gray'
    } else if (activeTab === 'category') {
      return colorConfig.categoryColors[item] || 'blue'
    } else {
      return colorConfig.typeColors[item] || 'blue'
    }
  }

  const formatLabel = (text) => {
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const items = activeTab === 'status' ? statuses : activeTab === 'category' ? categories : types

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        <SwatchIcon className="h-5 w-5" />
        Colors
        <ChevronDownIcon className="h-4 w-4" />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('status')}
                className={`pb-2 px-2 text-sm font-medium transition-colors ${
                  activeTab === 'status'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Status
              </button>
              <button
                onClick={() => setActiveTab('category')}
                className={`pb-2 px-2 text-sm font-medium transition-colors ${
                  activeTab === 'category'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Category
              </button>
              <button
                onClick={() => setActiveTab('type')}
                className={`pb-2 px-2 text-sm font-medium transition-colors ${
                  activeTab === 'type'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Type
              </button>
            </div>

            {/* Color Mappings */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => {
                const currentColorKey = getCurrentColor(item)
                const currentColor = AVAILABLE_COLORS[currentColorKey]

                return (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {formatLabel(item)}
                    </span>
                    <Menu as="div" className="relative">
                      <MenuButton
                        className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${currentColor.badge}`}
                      >
                        {currentColor.name}
                        <ChevronDownIcon className="h-3 w-3" />
                      </MenuButton>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <MenuItems className="absolute right-0 z-20 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="p-2 grid grid-cols-2 gap-1">
                            {Object.entries(AVAILABLE_COLORS).map(([key, color]) => (
                              <MenuItem key={key}>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleColorChange(item, key)}
                                    className={`rounded-md px-2 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${color.badge} ${
                                      active ? 'opacity-75' : ''
                                    } ${currentColorKey === key ? 'ring-2 ring-indigo-600' : ''}`}
                                  >
                                    {color.name}
                                  </button>
                                )}
                              </MenuItem>
                            ))}
                          </div>
                        </MenuItems>
                      </Transition>
                    </Menu>
                  </div>
                )
              })}
            </div>

            {items.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No {activeTab === 'status' ? 'statuses' : activeTab === 'category' ? 'categories' : 'types'} found
              </p>
            )}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  )
}
