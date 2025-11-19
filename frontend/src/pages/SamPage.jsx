import { useState } from 'react'

export default function SamPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sam</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to the Sam page
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Content for Sam page goes here.
          </p>
        </div>
      </div>
    </div>
  )
}