import { useState } from 'react'
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import PDFMeasurementTool from '../components/documents/PDFMeasurementTool'
import AccountsLayout from '../components/layout/AccountsLayout'

export default function PDFMeasurementTestPage() {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [showMeasureTool, setShowMeasureTool] = useState(false)

  // Sample PDFs for testing (you can add your own)
  const samplePDFs = [
    {
      name: 'Sample Blueprint',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'Test with a sample PDF'
    }
  ]

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
    } else {
      alert('Please upload a PDF file')
    }
  }

  const handleSamplePDF = (url) => {
    setPdfUrl(url)
    setPdfFile(null)
  }

  const openMeasureTool = () => {
    if (pdfUrl) {
      setShowMeasureTool(true)
    } else {
      alert('Please upload or select a PDF first')
    }
  }

  return (
    <AccountsLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PDF Measurement Tool - Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a PDF or select a sample to test the free measurement tool
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            1. Upload Your PDF
          </h2>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Click to upload PDF
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                or drag and drop
              </span>
            </label>
          </div>

          {pdfFile && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3">
              <DocumentTextIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  {pdfFile.name}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sample PDFs Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            2. Or Use a Sample PDF
          </h2>

          <div className="space-y-3">
            {samplePDFs.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSamplePDF(sample.url)}
                className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sample.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sample.description}
                    </p>
                  </div>
                  {pdfUrl === sample.url && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📐 How to Use the Measurement Tool
          </h2>

          <ol className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex gap-3">
              <span className="font-semibold">1.</span>
              <span>
                <strong>Set Scale:</strong> Click "Set Scale" and click 2 points on a known distance.
                Enter the real-world distance (e.g., 5 meters).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">2.</span>
              <span>
                <strong>Choose Tool:</strong> Select Linear (m), Area (m²), or Count (qty)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">3.</span>
              <span>
                <strong>Measure:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Linear: Click start point, then end point</li>
                  <li>• Area: Click 4 corners to define area</li>
                  <li>• Quantity: Click each item to count</li>
                </ul>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">4.</span>
              <span>
                <strong>Review:</strong> See all measurements in the right panel with running totals
              </span>
            </li>
          </ol>
        </div>

        {/* Open Tool Button */}
        <div className="flex justify-center">
          <button
            onClick={openMeasureTool}
            disabled={!pdfUrl}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
          >
            {pdfUrl ? '🚀 Open Measurement Tool' : '📄 Select a PDF first'}
          </button>
        </div>

        {/* Features List */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            ✨ Features
          </h3>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Measure linear distances in meters</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Calculate areas in square meters</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Count items/quantities</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Visual highlighting on PDF</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Calibrate/scale PDF to real-world units</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Running totals for all measurements</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Color-coded measurements</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Export measurements list</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Multi-page PDF support</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-gray-700 dark:text-gray-300">100% Free - No subscription needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render Measurement Tool */}
      {showMeasureTool && (
        <PDFMeasurementTool
          pdfUrl={pdfUrl}
          onClose={() => setShowMeasureTool(false)}
        />
      )}
    </AccountsLayout>
  )
}
