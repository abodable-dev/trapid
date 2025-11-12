import { useState, useRef, useEffect, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  ArrowsPointingOutIcon,
  Square2StackIcon,
  HashtagIcon,
  Cog6ToothIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF.js worker - use local version to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

/**
 * Free PDF Measurement Tool
 * Features:
 * - View PDF documents
 * - Calibrate/scale the PDF
 * - Measure linear distances (m)
 * - Measure areas (m²)
 * - Count quantities
 * - Highlight measurements
 * - Export measurement list
 */

const MEASUREMENT_TYPES = {
  LINEAR: 'linear',
  AREA: 'area',
  QUANTITY: 'quantity'
}

const COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316'  // orange
]

export default function PDFMeasurementTool({ pdfUrl, onClose }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [measurements, setMeasurements] = useState([])
  const [measurementType, setMeasurementType] = useState(MEASUREMENT_TYPES.LINEAR)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationScale, setCalibrationScale] = useState({ pixels: 100, realWorld: 1, unit: 'm' })
  const [currentPoints, setCurrentPoints] = useState([])
  const [showScaleModal, setShowScaleModal] = useState(false)
  const [tempCalibrationPixels, setTempCalibrationPixels] = useState(0)
  const [tempCalibrationPoints, setTempCalibrationPoints] = useState([])
  const [calibrationUnit, setCalibrationUnit] = useState('m')

  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const containerRef = useRef(null)

  // Memoize PDF.js options to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), [])

  useEffect(() => {
    // Redraw measurements when they change
    drawMeasurements()
  }, [measurements, scale, pageNumber])

  useEffect(() => {
    // Handle Escape key to cancel current measurement
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCurrentPoints([])
        setIsCalibrating(false)
        drawMeasurements()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error)
    alert('Failed to load PDF. Please try again or use a different PDF file.')
  }

  const handleCanvasClick = (e) => {
    const canvas = overlayCanvasRef.current
    if (!canvas) {
      console.error('Canvas not found in click handler')
      return
    }

    const rect = canvas.getBoundingClientRect()
    // Convert screen coordinates to canvas coordinates
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    console.log('Canvas clicked:', {
      x, y,
      scaleX, scaleY,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      rectWidth: rect.width,
      rectHeight: rect.height,
      isCalibrating,
      measurementType
    })

    if (isCalibrating) {
      handleCalibrationClick({ x, y })
    } else {
      handleMeasurementClick({ x, y })
    }
  }

  const handleCalibrationClick = (point) => {
    const newPoints = [...currentPoints, point]
    setCurrentPoints(newPoints)

    if (newPoints.length === 2) {
      // Calculate pixel distance
      const dx = newPoints[1].x - newPoints[0].x
      const dy = newPoints[1].y - newPoints[0].y
      const pixelDistance = Math.sqrt(dx * dx + dy * dy)

      // Store calibration data and show modal
      setTempCalibrationPixels(pixelDistance)
      setTempCalibrationPoints(newPoints)
      setCalibrationUnit('mm') // Default to mm for construction drawings
      setShowScaleModal(true)
      setIsCalibrating(false)
      setCurrentPoints([])
    } else {
      // Draw temporary point
      drawCalibrationLine(newPoints)
    }
  }

  const handleScaleSubmit = (realWorldDistance) => {
    if (realWorldDistance && !isNaN(realWorldDistance) && parseFloat(realWorldDistance) > 0) {
      // Convert to meters based on selected unit
      let distanceInMeters = parseFloat(realWorldDistance)
      if (calibrationUnit === 'mm') {
        distanceInMeters = distanceInMeters / 1000
      } else if (calibrationUnit === 'cm') {
        distanceInMeters = distanceInMeters / 100
      }

      setCalibrationScale({
        pixels: tempCalibrationPixels,
        realWorld: distanceInMeters,
        unit: 'm'
      })
      drawCalibrationLine(tempCalibrationPoints)
      setShowScaleModal(false)
      setTempCalibrationPixels(0)
      setTempCalibrationPoints([])
    }
  }

  const handleMeasurementClick = (point) => {
    const newPoints = [...currentPoints, point]
    setCurrentPoints(newPoints)

    if (measurementType === MEASUREMENT_TYPES.QUANTITY) {
      // Single click for quantity
      addMeasurement({
        type: MEASUREMENT_TYPES.QUANTITY,
        points: [point],
        value: 1,
        unit: 'qty',
        label: `Item ${measurements.filter(m => m.type === MEASUREMENT_TYPES.QUANTITY).length + 1}`
      })
      setCurrentPoints([])
    } else if (measurementType === MEASUREMENT_TYPES.LINEAR && newPoints.length === 2) {
      // Two clicks for linear measurement
      const value = calculateLinearDistance(newPoints)
      addMeasurement({
        type: MEASUREMENT_TYPES.LINEAR,
        points: newPoints,
        value,
        unit: 'm',
        label: `Distance ${measurements.filter(m => m.type === MEASUREMENT_TYPES.LINEAR).length + 1}`
      })
      setCurrentPoints([])
    } else if (measurementType === MEASUREMENT_TYPES.AREA && newPoints.length >= 3) {
      // Three or more clicks for area - double-click to close
      // For now, we'll use a simple approach: click 4 times to create rectangle
      if (newPoints.length === 4) {
        const value = calculateArea(newPoints)
        addMeasurement({
          type: MEASUREMENT_TYPES.AREA,
          points: newPoints,
          value,
          unit: 'm²',
          label: `Area ${measurements.filter(m => m.type === MEASUREMENT_TYPES.AREA).length + 1}`
        })
        setCurrentPoints([])
      }
    }

    // Draw current progress
    drawMeasurements(newPoints)
  }

  const calculateLinearDistance = (points) => {
    if (points.length < 2) return 0
    const dx = points[1].x - points[0].x
    const dy = points[1].y - points[0].y
    const pixelDistance = Math.sqrt(dx * dx + dy * dy)
    const realDistance = (pixelDistance / calibrationScale.pixels) * calibrationScale.realWorld
    return realDistance
  }

  const calculateArea = (points) => {
    if (points.length < 3) return 0

    // Using shoelace formula for polygon area
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    area = Math.abs(area / 2)

    // Convert pixel area to real-world area
    const pixelToMeterRatio = calibrationScale.realWorld / calibrationScale.pixels
    const realArea = area * pixelToMeterRatio * pixelToMeterRatio
    return realArea
  }

  const addMeasurement = (measurement) => {
    const colorIndex = measurements.length % COLORS.length
    setMeasurements([
      ...measurements,
      {
        ...measurement,
        id: Date.now(),
        color: COLORS[colorIndex],
        pageNumber
      }
    ])
  }

  const deleteMeasurement = (id) => {
    setMeasurements(measurements.filter(m => m.id !== id))
  }

  const drawCalibrationLine = (points) => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (points.length > 0) {
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      if (points.length === 2) {
        ctx.lineTo(points[1].x, points[1].y)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Draw points
      points.forEach(point => {
        ctx.fillStyle = '#3B82F6'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        ctx.fill()
      })
    }
  }

  const drawMeasurements = (tempPoints = []) => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw existing measurements for current page
    measurements
      .filter(m => m.pageNumber === pageNumber)
      .forEach(measurement => {
        ctx.strokeStyle = measurement.color
        ctx.fillStyle = measurement.color + '40' // 25% opacity
        ctx.lineWidth = 2

        if (measurement.type === MEASUREMENT_TYPES.QUANTITY) {
          // Draw circle for quantity
          ctx.beginPath()
          ctx.arc(measurement.points[0].x, measurement.points[0].y, 15, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()

          // Draw number
          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 14px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('1', measurement.points[0].x, measurement.points[0].y)
        } else if (measurement.type === MEASUREMENT_TYPES.LINEAR) {
          // Draw line
          ctx.beginPath()
          ctx.moveTo(measurement.points[0].x, measurement.points[0].y)
          ctx.lineTo(measurement.points[1].x, measurement.points[1].y)
          ctx.stroke()

          // Draw endpoints
          measurement.points.forEach(point => {
            ctx.fillStyle = measurement.color
            ctx.beginPath()
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
            ctx.fill()
          })

          // Draw label
          const midX = (measurement.points[0].x + measurement.points[1].x) / 2
          const midY = (measurement.points[0].y + measurement.points[1].y) / 2
          ctx.fillStyle = '#000000'
          ctx.font = 'bold 12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${measurement.value.toFixed(2)} ${measurement.unit}`, midX, midY - 10)
        } else if (measurement.type === MEASUREMENT_TYPES.AREA) {
          // Draw polygon
          ctx.beginPath()
          ctx.moveTo(measurement.points[0].x, measurement.points[0].y)
          for (let i = 1; i < measurement.points.length; i++) {
            ctx.lineTo(measurement.points[i].x, measurement.points[i].y)
          }
          ctx.closePath()
          ctx.fill()
          ctx.stroke()

          // Draw vertices
          measurement.points.forEach(point => {
            ctx.fillStyle = measurement.color
            ctx.beginPath()
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
            ctx.fill()
          })

          // Draw label at centroid
          const centroidX = measurement.points.reduce((sum, p) => sum + p.x, 0) / measurement.points.length
          const centroidY = measurement.points.reduce((sum, p) => sum + p.y, 0) / measurement.points.length
          ctx.fillStyle = '#000000'
          ctx.font = 'bold 12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${measurement.value.toFixed(2)} ${measurement.unit}`, centroidX, centroidY)
        }
      })

    // Draw current measurement in progress
    if (tempPoints.length > 0) {
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      ctx.beginPath()
      ctx.moveTo(tempPoints[0].x, tempPoints[0].y)
      for (let i = 1; i < tempPoints.length; i++) {
        ctx.lineTo(tempPoints[i].x, tempPoints[i].y)
      }
      if (measurementType === MEASUREMENT_TYPES.AREA && tempPoints.length > 2) {
        ctx.closePath()
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Draw points
      tempPoints.forEach(point => {
        ctx.fillStyle = '#10B981'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        ctx.fill()
      })
    }
  }

  const handlePageRender = (page) => {
    const canvas = overlayCanvasRef.current
    const pdfCanvas = document.querySelector('.react-pdf__Page__canvas')

    if (canvas && pdfCanvas) {
      // Set canvas dimensions to match PDF canvas
      canvas.width = pdfCanvas.width
      canvas.height = pdfCanvas.height
      canvas.style.width = pdfCanvas.style.width
      canvas.style.height = pdfCanvas.style.height

      // Debug: log dimensions
      console.log('Canvas dimensions set:', {
        width: canvas.width,
        height: canvas.height,
        styleWidth: canvas.style.width,
        styleHeight: canvas.style.height
      })

      drawMeasurements()
    } else {
      console.error('Canvas or PDF canvas not found', { canvas, pdfCanvas })
    }
  }

  const getTotals = () => {
    const totals = {
      linear: 0,
      area: 0,
      quantity: 0
    }

    measurements.forEach(m => {
      if (m.type === MEASUREMENT_TYPES.LINEAR) totals.linear += m.value
      if (m.type === MEASUREMENT_TYPES.AREA) totals.area += m.value
      if (m.type === MEASUREMENT_TYPES.QUANTITY) totals.quantity += m.value
    })

    return totals
  }

  const totals = getTotals()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      {/* Left Panel - PDF Viewer */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">PDF Measurement Tool</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Measurement Type Selection */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tool:</span>
            <button
              onClick={() => { setMeasurementType(MEASUREMENT_TYPES.LINEAR); setCurrentPoints([]) }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                measurementType === MEASUREMENT_TYPES.LINEAR
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <ArrowsPointingOutIcon className="h-5 w-5" />
              Linear (m)
            </button>
            <button
              onClick={() => { setMeasurementType(MEASUREMENT_TYPES.AREA); setCurrentPoints([]) }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                measurementType === MEASUREMENT_TYPES.AREA
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Square2StackIcon className="h-5 w-5" />
              Area (m²)
            </button>
            <button
              onClick={() => { setMeasurementType(MEASUREMENT_TYPES.QUANTITY); setCurrentPoints([]) }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                measurementType === MEASUREMENT_TYPES.QUANTITY
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <HashtagIcon className="h-5 w-5" />
              Count (qty)
            </button>
          </div>

          {/* Cancel Current Measurement */}
          {currentPoints.length > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2">
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                {measurementType === MEASUREMENT_TYPES.AREA
                  ? `Click ${4 - currentPoints.length} more point(s)`
                  : measurementType === MEASUREMENT_TYPES.LINEAR
                  ? `Click ${2 - currentPoints.length} more point(s)`
                  : 'Click to count'}
              </span>
              <button
                onClick={() => {
                  setCurrentPoints([])
                  drawMeasurements()
                }}
                className="ml-2 px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Scale and Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCalibrating(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                isCalibrating
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5" />
              {isCalibrating ? 'Click 2 points to calibrate' : 'Set Scale'}
            </button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Scale: {calibrationScale.pixels.toFixed(0)}px = {calibrationScale.realWorld}{calibrationScale.unit}
            </div>

            <div className="ml-auto flex items-center gap-4">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                  disabled={scale <= 0.5}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="Zoom out"
                >
                  -
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[4rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(Math.min(3.0, scale + 0.25))}
                  disabled={scale >= 3.0}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="Zoom in"
                >
                  +
                </button>
              </div>

              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(pageNumber - 1)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber(pageNumber + 1)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                >
                Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer with Overlay */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 p-4">
          <div className="relative inline-block">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              options={pdfOptions}
              className="pdf-document"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onRenderSuccess={handlePageRender}
                className="shadow-lg"
              />
            </Document>

            {/* Overlay Canvas for Measurements */}
            <canvas
              ref={overlayCanvasRef}
              onClick={handleCanvasClick}
              className="absolute top-0 left-0 cursor-crosshair"
              style={{
                pointerEvents: 'auto',
                zIndex: 10
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Measurements List */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Measurements</h3>
        </div>

        {/* Totals */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Length:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{totals.linear.toFixed(2)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Area:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{totals.area.toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{totals.quantity}</span>
            </div>
          </div>
        </div>

        {/* Measurement List */}
        <div className="flex-1 overflow-auto p-4">
          {measurements.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <p>No measurements yet.</p>
              <p className="text-sm mt-2">Select a tool and click on the PDF to start measuring.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {measurements.map((measurement, index) => (
                <div
                  key={measurement.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  style={{ borderLeftColor: measurement.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {measurement.label}
                      </div>
                      <div className="text-lg font-semibold" style={{ color: measurement.color }}>
                        {measurement.value.toFixed(2)} {measurement.unit}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Page {measurement.pageNumber}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMeasurement(measurement.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            disabled={measurements.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              const data = {
                totals,
                measurements: measurements.map(m => ({
                  label: m.label,
                  type: m.type,
                  value: m.value,
                  unit: m.unit,
                  pageNumber: m.pageNumber
                }))
              }
              console.log('Export measurements:', data)
              alert('Measurements exported to console!')
            }}
          >
            Export Measurements
          </button>
        </div>
      </div>

      {/* Scale Calibration Modal */}
      {showScaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Set Scale
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You've drawn a line of {tempCalibrationPixels.toFixed(2)} pixels.
              Enter the real-world distance of this line to calibrate measurements.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.target.elements.distance
                handleScaleSubmit(input.value)
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit
                </label>
                <select
                  value={calibrationUnit}
                  onChange={(e) => setCalibrationUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-3"
                >
                  <option value="mm">Millimeters (mm)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="m">Meters (m)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Real-world distance ({calibrationUnit})
                </label>
                <input
                  type="number"
                  name="distance"
                  step={calibrationUnit === 'mm' ? '1' : '0.01'}
                  min={calibrationUnit === 'mm' ? '1' : '0.01'}
                  required
                  autoFocus
                  placeholder={calibrationUnit === 'mm' ? 'e.g., 5000' : calibrationUnit === 'cm' ? 'e.g., 500' : 'e.g., 5.0'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowScaleModal(false)
                    setTempCalibrationPixels(0)
                    setTempCalibrationPoints([])
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Set Scale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
