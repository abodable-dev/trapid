import { useState } from 'react'
import { Tab } from '@headlessui/react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const documentCategories = [
  { id: 'site-plan', name: 'Site Plan' },
  { id: 'sales', name: 'Sales' },
  { id: 'certification', name: 'Certification' },
  { id: 'client', name: 'Client' },
  { id: 'client-photo', name: 'Client Photo' },
  { id: 'final-certificate', name: 'Final Certificate' },
]

export default function DocumentCategoryTabs({ jobId, onCategoryChange, children }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleChange = (index) => {
    setSelectedIndex(index)
    if (onCategoryChange) {
      onCategoryChange(documentCategories[index])
    }
  }

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={handleChange}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <Tab.List className="flex space-x-8 px-4">
          {documentCategories.map((category) => (
            <Tab
              key={category.id}
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors',
                  selected
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              {category.name}
            </Tab>
          ))}
        </Tab.List>
      </div>
      <Tab.Panels className="mt-6">
        {documentCategories.map((category) => (
          <Tab.Panel key={category.id} className="focus:outline-none">
            {children(category)}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  )
}
