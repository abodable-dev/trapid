import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { Table, BarChart3, Clock, Plus, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'

export default function Dashboard() {
 const navigate = useNavigate()
 const [tables, setTables] = useState([])
 const [filteredTables, setFilteredTables] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [searchParams] = useSearchParams()
 const searchQuery = searchParams.get('search') || ''
 const [showCreateSheet, setShowCreateSheet] = useState(false)
 const [newTableName, setNewTableName] = useState('')
 const [creating, setCreating] = useState(false)
 const [createError, setCreateError] = useState(null)

 useEffect(() => {
 loadTables()
 }, [])

 useEffect(() => {
 if (searchQuery) {
 const filtered = tables.filter(table =>
 table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (table.description && table.description.toLowerCase().includes(searchQuery.toLowerCase()))
 )
 setFilteredTables(filtered)
 } else {
 setFilteredTables(tables)
 }
 }, [searchQuery, tables])

 const loadTables = async () => {
 try {
 setLoading(true)
 const response = await api.get('/api/v1/tables')
 // Only show tables that are marked as live
 const liveTables = (response.tables || []).filter(table => table.is_live)
 setTables(liveTables)
 } catch (err) {
 setError('Failed to load tables')
 console.error(err)
 } finally {
 setLoading(false)
 }
 }

 const handleCreateTable = async (e) => {
 if (e) e.preventDefault()

 if (!newTableName.trim()) {
 setCreateError('Table name is required')
 return
 }

 setCreating(true)
 setCreateError(null)

 try {
 // Step 1: Create the table
 const tableResponse = await api.post('/api/v1/tables', {
 table: {
 name: newTableName,
 searchable: true
 }
 })

 if (!tableResponse.success || !tableResponse.table) {
 setCreateError('Failed to create table')
 return
 }

 const tableId = tableResponse.table.id

 // Step 2: Create default columns
 const defaultColumns = [
 { name: 'Name', column_type: 'single_line_text', is_title: true },
 { name: 'Email', column_type: 'email', is_title: false },
 { name: 'Phone', column_type: 'single_line_text', is_title: false },
 { name: 'Status', column_type: 'single_line_text', is_title: false },
 { name: 'Created Date', column_type: 'date', is_title: false },
 ]

 for (let index = 0; index < defaultColumns.length; index++) {
 const col = defaultColumns[index]
 const columnData = {
 name: col.name,
 column_name: col.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
 column_type: col.column_type,
 is_title: col.is_title,
 searchable: true,
 required: false
 }

 const columnResponse = await api.post(`/api/v1/tables/${tableId}/columns`, {
 column: columnData
 })

 if (!columnResponse.success) {
 setCreateError(`Failed to create column: ${col.name}`)
 return
 }
 }

 // Step 3: Mark table as live
 await api.put(`/api/v1/tables/${tableId}`, {
 table: { is_live: true }
 })

 // Step 4: Close sheet and navigate
 setShowCreateSheet(false)
 setNewTableName('')
 navigate(`/tables/${tableId}`)
 } catch (err) {
 console.error('Table creation error:', err)
 setCreateError(err.response?.data?.error || err.message || 'Failed to create table')
 } finally {
 setCreating(false)
 }
 }

 if (loading) {
 return (
 <div className="flex items-center justify-center h-[calc(100vh-64px)]">
 <div className="text-center">
 <span className="loading loading-infinity loading-lg"></span>
 <p className="mt-4 text-foreground-secondary">Loading tables...</p>
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className="flex items-center justify-center h-[calc(100vh-64px)]">
 <div className="text-center">
 <div className="text-error">{error}</div>
 </div>
 </div>
 )
 }

 // Calculate stats
 const totalTables = tables.length
 const totalRecords = tables.reduce((sum, table) => sum + (table.record_count || 0), 0)

 // Format date helper
 const formatDate = (dateString) => {
 if (!dateString) return 'Never'
 const date = new Date(dateString)
 const now = new Date()
 const diffMs = now - date
 const diffMins = Math.floor(diffMs / 60000)
 const diffHours = Math.floor(diffMs / 3600000)
 const diffDays = Math.floor(diffMs / 86400000)

 if (diffMins < 1) return 'Just now'
 if (diffMins < 60) return `${diffMins}m ago`
 if (diffHours < 24) return `${diffHours}h ago`
 if (diffDays < 7) return `${diffDays}d ago`
 return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
 }

 return (
 <div className="min-h-screen">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-sm font-medium text-foreground mb-6">Dashboard</h1>

 {/* Stats Overview */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <Card className="hover:border-gray-700 transition-colors">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-medium text-foreground-secondary">
 Total Tables
 </CardTitle>
 <Table className="w-3.5 h-3.5 text-foreground-muted" />
 </div>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-mono font-semibold text-foreground">
 {totalTables}
 </div>
 </CardContent>
 </Card>

 <Card className="hover:border-gray-700 transition-colors">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-medium text-foreground-secondary">
 Total Records
 </CardTitle>
 <BarChart3 className="w-3.5 h-3.5 text-foreground-muted" />
 </div>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-mono font-semibold text-foreground">
 {totalRecords.toLocaleString()}
 </div>
 </CardContent>
 </Card>

 <Card className="hover:border-gray-700 transition-colors">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-medium text-foreground-secondary">
 Last Activity
 </CardTitle>
 <Clock className="w-3.5 h-3.5 text-foreground-muted" />
 </div>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-mono font-semibold text-foreground">
 {tables.length > 0 ? formatDate(tables.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]?.updated_at) : 'Never'}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Quick Actions */}
 <div className="flex gap-3">
 <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
 <SheetTrigger asChild>
 <Button onClick={() => {
 setNewTableName('')
 setCreateError(null)
 }}>
 <Plus className="w-3.5 h-3.5" />
 Create New Table
 </Button>
 </SheetTrigger>
 <SheetContent side="right">
 <SheetHeader>
 <SheetTitle>Create New Table</SheetTitle>
 <SheetDescription>
 Give your table a name. We'll create it with default columns (Name, Email, Phone, Status, Created Date) that you can customize later.
 </SheetDescription>
 </SheetHeader>
 <form onSubmit={handleCreateTable} className="space-y-6 py-6">
 <div className="space-y-2">
 <label htmlFor="tableName" className="text-sm font-medium text-foreground">
 Table Name
 </label>
 <Input
 id="tableName"
 value={newTableName}
 onChange={(e) => setNewTableName(e.target.value)}
 placeholder="e.g., Contacts, Tasks, Projects..."
 autoFocus
 />
 {createError && (
 <p className="text-sm text-error">{createError}</p>
 )}
 </div>
 <SheetFooter>
 <Button
 type="button"
 variant="outline"
 onClick={() => setShowCreateSheet(false)}
 disabled={creating}
 >
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={creating || !newTableName.trim()}
 >
 {creating ? 'Creating...' : 'Create Table'}
 </Button>
 </SheetFooter>
 </form>
 </SheetContent>
 </Sheet>

 <Button variant="outline" asChild>
 <Link to="/import">
 <Upload className="w-3.5 h-3.5" />
 Import Spreadsheet
 </Link>
 </Button>
 </div>
 </div>

 {searchQuery && (
 <div className="mb-4 text-sm text-foreground-secondary">
 Showing {filteredTables.length} result{filteredTables.length !== 1 ? 's' : ''} for"{searchQuery}"
 <Link to="/dashboard" className="ml-2 text-foreground hover:underline">
 Clear search
 </Link>
 </div>
 )}

 {tables.length === 0 ? (
 <Card className="py-16">
 <CardContent className="text-center">
 <Table className="mx-auto w-6 h-6 text-foreground-muted mb-4" />
 <h3 className="text-sm font-medium text-foreground mb-2">No tables yet</h3>
 <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
 Get started by creating a new table or importing a spreadsheet to begin organizing your data.
 </p>
 <div className="flex gap-3 justify-center">
 <Button onClick={() => {
 setShowCreateSheet(true)
 setNewTableName('')
 setCreateError(null)
 }}>
 <Plus className="w-3.5 h-3.5" />
 Create Your First Table
 </Button>
 <Button variant="outline" asChild>
 <Link to="/import">
 <Upload className="w-3.5 h-3.5" />
 Import Spreadsheet
 </Link>
 </Button>
 </div>
 </CardContent>
 </Card>
 ) : filteredTables.length === 0 ? (
 <Card className="py-12">
 <CardContent className="text-center">
 <h3 className="text-sm font-medium text-foreground mb-2">No tables found</h3>
 <p className="text-foreground-secondary mb-6">
 No tables match your search query"{searchQuery}".
 </p>
 <Button asChild>
 <Link to="/dashboard">
 Clear search
 </Link>
 </Button>
 </CardContent>
 </Card>
 ) : (
 <div>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-sm font-medium text-foreground">All Tables</h2>
 <p className="text-sm text-foreground-secondary">
 {filteredTables.length} {filteredTables.length === 1 ? 'table' : 'tables'}
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredTables.map((table) => (
 <Link
 key={table.id}
 to={`/tables/${table.id}`}
 className="block"
 >
 <Card className="h-full hover:border-gray-700 transition-colors group cursor-pointer">
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <CardTitle className="truncate group-hover:text-white transition-colors">
 {table.name}
 </CardTitle>
 {table.description && (
 <p className="text-sm text-foreground-secondary mt-1 line-clamp-2">
 {table.description}
 </p>
 )}
 </div>
 {table.icon && (
 <span className="text-2xl ml-3 flex-shrink-0">{table.icon}</span>
 )}
 </div>
 </CardHeader>

 <CardContent>
 <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
 <div className="flex items-center gap-1 text-foreground-secondary">
 <BarChart3 className="w-3.5 h-3.5" />
 <span>{(table.record_count || 0).toLocaleString()} {table.record_count === 1 ? 'record' : 'records'}</span>
 </div>
 <div className="flex items-center gap-1 text-foreground-muted">
 <Clock className="w-3.5 h-3.5" />
 <span>{formatDate(table.updated_at)}</span>
 </div>
 </div>
 </CardContent>
 </Card>
 </Link>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 )
}
