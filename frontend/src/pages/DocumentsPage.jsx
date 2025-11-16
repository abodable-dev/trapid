import { useState, useRef, useEffect } from 'react'
import { DocumentTextIcon, CloudArrowUpIcon, XMarkIcon, MagnifyingGlassIcon, FunnelIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'
import PDFMeasurementTool from '../components/documents/PDFMeasurementTool'

export default function DocumentsPage() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const [showMeasureTool, setShowMeasureTool] = useState(false)
  const [measurePdfUrl, setMeasurePdfUrl] = useState(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterJobLinked, setFilterJobLinked] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Document type field requirements
  const documentFieldRequirements = {
    'Invoice': ['Invoice Number', 'Date', 'Supplier', 'Total Amount', 'GST', 'Purchase Order'],
    'Frame Inspection Report': ['Inspection Date', 'Inspector', 'Job Address', 'Stage', 'Status'],
    'Supplier Quote': ['Quote Number', 'Date', 'Supplier', 'Total', 'Valid Until'],
    'Site Photo': ['Date Taken', 'Location', 'Job Address'],
    'Contract/Agreement': ['Contract Number', 'Date', 'Client Name', 'Property Address', 'Contract Value'],
    'Compliance Certificate': ['Certificate Type', 'Certificate Number', 'Issue Date', 'Property Address'],
    'General Document': ['File Type', 'Date References']
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (newFiles) => {
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]

    const validFiles = newFiles.filter(file => {
      const isValidType = allowedTypes.includes(file.type) ||
                         file.name.match(/\.(pdf|png|jpg|jpeg|docx|doc)$/i)
      const isValidSize = file.size <= 20 * 1024 * 1024 // 20MB max
      return isValidType && isValidSize
    })

    if (validFiles.length === 0) {
      alert('Please upload PDF, images (PNG/JPG), or Word documents (max 20MB each)')
      return
    }

    // Add files with mock extracted data for demo
    const filesWithData = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'pending',
      extractedData: null,
      previewUrl: URL.createObjectURL(file)
    }))

    setFiles(prev => [...prev, ...filesWithData])

    // Simulate AI analysis
    setAnalyzing(true)
    for (const fileData of filesWithData) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      analyzeDocument(fileData)
    }
    setAnalyzing(false)
  }

  const analyzeDocument = (fileData) => {
    // Mock AI extraction based on filename patterns
    const fileName = fileData.name.toLowerCase()
    let extractedData = {}

    if (fileName.includes('invoice') || fileName.includes('inv')) {
      extractedData = {
        documentType: 'Invoice',
        confidence: 0.95,
        fields: {
          'Invoice Number': 'INV-2024-001234',
          'Date': '2024-01-15',
          'Supplier': 'ABC Building Supplies',
          'Total Amount': '$4,567.89',
          'GST': '$415.26',
          'Payment Terms': 'Net 30',
          'Purchase Order': 'PO-2024-0567'
        },
        suggestedAction: 'Attach to Purchase Order PO-2024-0567',
        matchedEntity: {
          type: 'purchase_order',
          id: 567,
          number: 'PO-2024-0567'
        }
      }
    } else if (fileName.includes('inspection') || fileName.includes('frame')) {
      extractedData = {
        documentType: 'Frame Inspection Report',
        confidence: 0.92,
        fields: {
          'Inspection Date': '2024-01-20',
          'Inspector': 'John Smith',
          'Job Address': '123 Main St, Sydney',
          'Stage': 'Frame',
          'Status': 'Passed with conditions',
          'Defects Found': '2 minor issues',
          'Next Inspection': 'Lock-up stage'
        },
        suggestedAction: 'Attach to Job #45 and Frame Inspection task',
        matchedEntity: {
          type: 'construction',
          id: 45,
          address: '123 Main St, Sydney'
        }
      }
    } else if (fileName.includes('quote') || fileName.includes('quotation')) {
      extractedData = {
        documentType: 'Supplier Quote',
        confidence: 0.88,
        fields: {
          'Quote Number': 'Q-2024-789',
          'Date': '2024-01-10',
          'Supplier': 'Elite Plumbing Supplies',
          'Total': '$12,340.00',
          'Valid Until': '2024-02-10',
          'Items': '15 line items',
          'Delivery Time': '5-7 business days'
        },
        suggestedAction: 'Create Purchase Order or attach to existing supplier',
        matchedEntity: {
          type: 'supplier',
          id: 12,
          name: 'Elite Plumbing Supplies'
        }
      }
    } else if (fileName.includes('photo') || fileName.includes('site') || fileData.type.startsWith('image/')) {
      extractedData = {
        documentType: 'Site Photo',
        confidence: 0.85,
        fields: {
          'Date Taken': '2024-01-18',
          'Location': 'Extracted from EXIF if available',
          'Description': 'Construction site progress photo',
          'Detected Objects': 'Building frame, scaffolding, equipment',
          'Weather Conditions': 'Clear sky, good visibility'
        },
        suggestedAction: 'Attach to Job with date and location metadata',
        matchedEntity: {
          type: 'construction',
          id: null,
          note: 'Location matching needed'
        }
      }
    } else if (fileName.includes('contract') || fileName.includes('agreement')) {
      extractedData = {
        documentType: 'Contract/Agreement',
        confidence: 0.90,
        fields: {
          'Contract Number': 'CON-2024-034',
          'Date': '2024-01-05',
          'Client Name': 'Smith Family Trust',
          'Property Address': '456 Oak Avenue, Melbourne',
          'Contract Value': '$485,000',
          'Start Date': '2024-02-01',
          'Completion Date': '2024-08-30'
        },
        suggestedAction: 'Create new job or attach to existing client',
        matchedEntity: {
          type: 'contact',
          id: 23,
          name: 'Smith Family Trust'
        }
      }
    } else if (fileName.includes('certificate') || fileName.includes('compliance')) {
      extractedData = {
        documentType: 'Compliance Certificate',
        confidence: 0.87,
        fields: {
          'Certificate Type': 'Occupancy Certificate',
          'Certificate Number': 'OC-2024-1234',
          'Issue Date': '2024-01-25',
          'Property Address': '789 Beach Road, Brisbane',
          'Issued By': 'Brisbane City Council',
          'Expiry Date': 'N/A - Permanent',
          'Conditions': 'None'
        },
        suggestedAction: 'Attach to Job #67 final documentation',
        matchedEntity: {
          type: 'construction',
          id: 67,
          address: '789 Beach Road, Brisbane'
        }
      }
    } else {
      extractedData = {
        documentType: 'General Document',
        confidence: 0.70,
        fields: {
          'File Type': fileData.type,
          'Pages': 'Multiple pages detected',
          'Contains Text': 'Yes',
          'Date References': 'January 2024',
          'Contains Tables': 'Yes',
          'Contains Images': 'No'
        },
        suggestedAction: 'Manual classification recommended',
        matchedEntity: null
      }
    }

    setFiles(prev => prev.map(f =>
      f.id === fileData.id
        ? { ...f, status: 'analyzed', extractedData }
        : f
    ))
  }

  const removeFile = (fileId) => {
    const fileToRemove = files.find(f => f.id === fileId)
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl)
    }
    setFiles(prev => prev.filter(f => f.id !== fileId))
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl)
        }
      })
    }
  }, [])

  // Filter files based on search and filters
  const filteredFiles = files.filter(file => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = file.name.toLowerCase().includes(query)
      const matchesType = file.extractedData?.documentType.toLowerCase().includes(query)
      const matchesPO = file.extractedData?.fields['Purchase Order']?.toLowerCase().includes(query)
      const matchesInvoice = file.extractedData?.fields['Invoice Number']?.toLowerCase().includes(query)

      if (!matchesName && !matchesType && !matchesPO && !matchesInvoice) {
        return false
      }
    }

    // Document type filter
    if (filterType !== 'all' && file.extractedData) {
      const docType = file.extractedData.documentType.toLowerCase()
      if (filterType === 'invoice' && !docType.includes('invoice')) return false
      if (filterType === 'inspection' && !docType.includes('inspection')) return false
      if (filterType === 'quote' && !docType.includes('quote')) return false
      if (filterType === 'certificate' && !docType.includes('certificate')) return false
      if (filterType === 'photo' && !docType.includes('photo')) return false
      if (filterType === 'contract' && !docType.includes('contract')) return false
    }

    // Job linked filter
    if (filterJobLinked !== 'all' && file.extractedData) {
      const hasJob = file.extractedData.matchedEntity?.type === 'construction'
      if (filterJobLinked === 'linked' && !hasJob) return false
      if (filterJobLinked === 'unlinked' && hasJob) return false
    }

    // Date filter
    if (filterDate && file.extractedData) {
      const dateFields = Object.entries(file.extractedData.fields)
        .filter(([key]) => key.toLowerCase().includes('date'))
        .map(([, value]) => value)

      const matchesDate = dateFields.some(date =>
        typeof date === 'string' && date.includes(filterDate)
      )

      if (!matchesDate) return false
    }

    return true
  })

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Document AI Analyzer</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Drop documents here to see what data AI can extract. Supports invoices, inspection reports, quotes, photos, contracts, and certificates.
        </p>
      </div>

      {/* Search and Filters - Only show when no file is selected */}
      {files.length > 0 && !selectedFile && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by filename, type, PO number, invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ${
                showFilters
                  ? 'bg-indigo-600 text-white ring-indigo-600'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
              {(filterType !== 'all' || filterJobLinked !== 'all' || filterDate) && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {[filterType !== 'all', filterJobLinked !== 'all', filterDate !== ''].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Document Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="invoice">Invoices</option>
                    <option value="inspection">Inspection Reports</option>
                    <option value="quote">Quotes</option>
                    <option value="certificate">Certificates</option>
                    <option value="photo">Photos</option>
                    <option value="contract">Contracts</option>
                  </select>
                </div>

                {/* Job Linked Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Linked
                  </label>
                  <select
                    value={filterJobLinked}
                    onChange={(e) => setFilterJobLinked(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="all">All Documents</option>
                    <option value="linked">Linked to Job</option>
                    <option value="unlinked">Not Linked</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Contains
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2024-01, January"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {(filterType !== 'all' || filterJobLinked !== 'all' || filterDate || searchQuery) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterType('all')
                      setFilterJobLinked('all')
                      setFilterDate('')
                      setSearchQuery('')
                    }}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredFiles.length} of {files.length} documents
          </div>
        </div>
      )}

      {/* Drag and Drop Zone - Only show when no files uploaded and no file selected */}
      {files.length === 0 && !selectedFile && (
        <>
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            } ${analyzing ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
              multiple
              onChange={handleChange}
              disabled={analyzing}
            />

            <div className="space-y-4">
              <div className="text-gray-400 dark:text-gray-500">
                <CloudArrowUpIcon className="mx-auto h-16 w-16" />
              </div>

              {analyzing ? (
                <div className="text-gray-600 dark:text-gray-400">
                  <div className="font-medium">Analyzing documents...</div>
                  <div className="text-sm mt-1">AI is extracting data from your files</div>
                </div>
              ) : (
                <>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    Drop your documents here, or{' '}
                    <button
                      type="button"
                      onClick={handleClick}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      browse
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Supports PDF, Images (PNG/JPG), Word documents up to 20MB each
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Document Types Info */}
          <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
            <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-3">AI Can Extract From:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-indigo-800 dark:text-indigo-400">
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <strong>Invoices:</strong> Invoice #, date, supplier, amounts, PO matching
                </div>
              </div>
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <strong>Inspection Reports:</strong> Date, inspector, status, job matching
                </div>
              </div>
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <strong>Quotes:</strong> Quote #, supplier, items, totals, validity
                </div>
              </div>
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <strong>Site Photos:</strong> EXIF data, location, date, object detection
                </div>
              </div>
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <strong>Contracts:</strong> Client, address, value, dates, terms
                </div>
              </div>
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <strong>Certificates:</strong> Type, number, dates, property, issuer
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Analyzed Documents */}
      {files.length > 0 && !selectedFile && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analyzed Documents ({filteredFiles.length})
            </h2>
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              Upload More
            </button>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No documents match your search or filters</p>
            </div>
          ) : (
            filteredFiles.map(fileData => (
              <div key={fileData.id} className="space-y-6">
                {/* Document Header */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {fileData.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatFileSize(fileData.size)} • {fileData.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      title="Remove document"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {fileData.status === 'pending' && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                      Analyzing document...
                    </div>
                  )}

                  {fileData.status === 'analyzed' && fileData.extractedData && (
                    <div className="mt-4 flex items-center gap-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                        {fileData.extractedData.documentType}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {(fileData.extractedData.confidence * 100).toFixed(0)}% confidence
                      </span>
                      {fileData.type === 'application/pdf' && (
                        <button
                          onClick={() => {
                            setMeasurePdfUrl(fileData.previewUrl)
                            setShowMeasureTool(true)
                          }}
                          className="inline-flex items-center gap-x-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          <ArrowsPointingOutIcon className="h-4 w-4" />
                          Measure
                        </button>
                      )}
                      {fileData.extractedData.matchedEntity?.type === 'construction' ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                          <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-green-900 dark:text-green-300">
                            Job #{fileData.extractedData.matchedEntity.id}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                          <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                            Not linked to job
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Document Preview */}
                {fileData.status === 'analyzed' && fileData.extractedData && (
                  <>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Document Preview</h3>
                      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: '50vh' }}>
                        {fileData.type.startsWith('image/') ? (
                          <img
                            src={fileData.previewUrl}
                            alt={fileData.name}
                            className="w-full h-full object-contain"
                          />
                        ) : fileData.type === 'application/pdf' ? (
                          <iframe
                            src={fileData.previewUrl}
                            className="w-full h-full border-0"
                            title={fileData.name}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <DocumentTextIcon className="h-20 w-20 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Extracted Data Table */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Extracted Data</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Field Name
                              </th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Value
                              </th>
                              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {documentFieldRequirements[fileData.extractedData.documentType]?.map(fieldName => {
                              const value = fileData.extractedData.fields[fieldName]
                              const hasValue = value !== undefined && value !== null && value !== ''

                              return (
                                <tr key={fieldName} className={hasValue ? '' : 'bg-red-50 dark:bg-red-900/10'}>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {fieldName}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                    {hasValue ? value : (
                                      <span className="text-gray-400 dark:text-gray-500 italic">Not detected</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {hasValue ? (
                                      <svg className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}

                            {/* Show additional fields not in requirements */}
                            {Object.entries(fileData.extractedData.fields)
                              .filter(([key]) => !documentFieldRequirements[fileData.extractedData.documentType]?.includes(key))
                              .map(([key, value]) => (
                                <tr key={key} className="bg-blue-50 dark:bg-blue-900/10">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {key}
                                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Additional)</span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                    {value}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Suggested Action */}
                    {fileData.extractedData.suggestedAction && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                        <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                          Suggested Action:
                        </h4>
                        <p className="text-sm text-green-800 dark:text-green-400 mb-4">
                          {fileData.extractedData.suggestedAction}
                        </p>
                        <button
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                          onClick={() => {
                            alert('Attach functionality coming soon!')
                          }}
                        >
                          Attach to {fileData.extractedData.matchedEntity?.type || 'Entity'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected Document Detail View */}
      {selectedFile && selectedFile.status === 'analyzed' && selectedFile.extractedData && (
        <div className="mt-8 space-y-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedFile(null)}
              className="inline-flex items-center gap-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Documents
            </button>
          </div>

          {/* Document Type and Job Match Status */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedFile.extractedData.documentType}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedFile.extractedData.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  {selectedFile.extractedData.matchedEntity?.type === 'construction' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                        <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-green-900 dark:text-green-300">
                          Matched to Job #{selectedFile.extractedData.matchedEntity.id}
                        </span>
                      </div>
                      {selectedFile.extractedData.matchedEntity.address && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedFile.extractedData.matchedEntity.address}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                      <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-yellow-900 dark:text-yellow-300">
                        Not Matched to Job
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile.name} • {formatFileSize(selectedFile.size)}
                </p>
              </div>

              <button
                onClick={() => {
                  removeFile(selectedFile.id)
                  setSelectedFile(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                title="Remove document"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Document Preview - Top half of screen */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Document Preview</h3>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: '50vh' }}>
              {selectedFile.type.startsWith('image/') ? (
                <img
                  src={selectedFile.previewUrl}
                  alt={selectedFile.name}
                  className="w-full h-full object-contain"
                />
              ) : selectedFile.type === 'application/pdf' ? (
                <iframe
                  src={selectedFile.previewUrl}
                  className="w-full h-full border-0"
                  title={selectedFile.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <DocumentTextIcon className="h-20 w-20 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Preview not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Data Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Extracted Data</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Field Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {documentFieldRequirements[selectedFile.extractedData.documentType]?.map(fieldName => {
                    const value = selectedFile.extractedData.fields[fieldName]
                    const hasValue = value !== undefined && value !== null && value !== ''

                    return (
                      <tr key={fieldName} className={hasValue ? '' : 'bg-red-50 dark:bg-red-900/10'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {fieldName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {hasValue ? value : (
                            <span className="text-gray-400 dark:text-gray-500 italic">Not detected</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasValue ? (
                            <svg className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </td>
                      </tr>
                    )
                  })}

                  {/* Show additional fields not in requirements */}
                  {Object.entries(selectedFile.extractedData.fields)
                    .filter(([key]) => !documentFieldRequirements[selectedFile.extractedData.documentType]?.includes(key))
                    .map(([key, value]) => (
                      <tr key={key} className="bg-blue-50 dark:bg-blue-900/10">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {key}
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Additional)</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {value}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suggested Action */}
          {selectedFile.extractedData.suggestedAction && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                Suggested Action:
              </h4>
              <p className="text-sm text-green-800 dark:text-green-400 mb-4">
                {selectedFile.extractedData.suggestedAction}
              </p>
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                onClick={() => {
                  alert('Attach functionality coming soon!')
                }}
              >
                Attach to {selectedFile.extractedData.matchedEntity?.type || 'Entity'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PDF Measurement Tool */}
      {showMeasureTool && measurePdfUrl && (
        <PDFMeasurementTool
          pdfUrl={measurePdfUrl}
          onClose={() => {
            setShowMeasureTool(false)
            setMeasurePdfUrl(null)
          }}
        />
      )}

    </div>
  )
}
