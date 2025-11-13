import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

export default function ComponentsDemo() {
 const [name, setName] = useState('')
 const [email, setEmail] = useState('')

 return (
 <div className="min-h-screen bg-black p-8">
 <div className="max-w-6xl mx-auto space-y-12">
 {/* Header */}
 <div className="space-y-2">
 <h1 className="text-3xl font-bold text-foreground">Component Library Demo</h1>
 <p className="text-foreground-secondary">Midday.ai inspired UI components for Trapid</p>
 </div>

 {/* Buttons Section */}
 <section className="space-y-4">
 <h2 className="text-2xl font-semibold text-foreground">Buttons</h2>
 <Card>
 <CardHeader>
 <CardTitle>Button Variants</CardTitle>
 <CardDescription>All available button styles and sizes</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex flex-wrap gap-2">
 <Button>Default</Button>
 <Button variant="primary">Primary</Button>
 <Button variant="outline">Outline</Button>
 <Button variant="ghost">Ghost</Button>
 <Button variant="link">Link</Button>
 <Button variant="destructive">Destructive</Button>
 </div>
 <div className="flex flex-wrap gap-2">
 <Button size="sm">Small</Button>
 <Button size="default">Default</Button>
 <Button size="lg">Large</Button>
 <Button size="icon">+</Button>
 </div>
 <div className="flex flex-wrap gap-2">
 <Button disabled>Disabled</Button>
 <Button variant="outline" disabled>Disabled Outline</Button>
 </div>
 </CardContent>
 </Card>
 </section>

 {/* Inputs Section */}
 <section className="space-y-4">
 <h2 className="text-2xl font-semibold text-foreground">Inputs</h2>
 <Card>
 <CardHeader>
 <CardTitle>Form Inputs</CardTitle>
 <CardDescription>Text input with Midday styling</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Name</label>
 <Input
 type="text"
 placeholder="Enter your name"
 value={name}
 onChange={(e) => setName(e.target.value)}
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Email</label>
 <Input
 type="email"
 placeholder="you@example.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Password</label>
 <Input type="password" placeholder="Enter password" />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Disabled</label>
 <Input disabled placeholder="Disabled input" />
 </div>
 </CardContent>
 </Card>
 </section>

 {/* Badges Section */}
 <section className="space-y-4">
 <h2 className="text-2xl font-semibold text-foreground">Badges</h2>
 <Card>
 <CardHeader>
 <CardTitle>Badge Variants</CardTitle>
 <CardDescription>Status indicators and labels</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="flex flex-wrap gap-2">
 <Badge variant="default">Default</Badge>
 <Badge variant="success">Success</Badge>
 <Badge variant="warning">Warning</Badge>
 <Badge variant="error">Error</Badge>
 <Badge variant="info">Info</Badge>
 <Badge variant="outline">Outline</Badge>
 </div>
 <div className="flex flex-wrap gap-2 mt-4">
 <Badge variant="green">Active</Badge>
 <Badge variant="red">Cancelled</Badge>
 <Badge variant="yellow">Pending</Badge>
 <Badge variant="blue">Approved</Badge>
 <Badge variant="purple">Invoiced</Badge>
 <Badge variant="pink">Custom</Badge>
 </div>
 </CardContent>
 </Card>
 </section>

 {/* Dialog & Sheet Section */}
 <section className="space-y-4">
 <h2 className="text-2xl font-semibold text-foreground">Modals & Panels</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Dialog */}
 <Card>
 <CardHeader>
 <CardTitle>Dialog (Modal)</CardTitle>
 <CardDescription>Center modal for confirmations</CardDescription>
 </CardHeader>
 <CardContent>
 <Dialog>
 <DialogTrigger asChild>
 <Button variant="outline">Open Dialog</Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Are you sure?</DialogTitle>
 <DialogDescription>
 This action cannot be undone. This will permanently delete your data.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter>
 <Button variant="outline">Cancel</Button>
 <Button variant="destructive">Delete</Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </CardContent>
 </Card>

 {/* Sheet */}
 <Card>
 <CardHeader>
 <CardTitle>Sheet (Side Panel)</CardTitle>
 <CardDescription>Slide-out panel for forms</CardDescription>
 </CardHeader>
 <CardContent>
 <Sheet>
 <SheetTrigger asChild>
 <Button>Open Sheet</Button>
 </SheetTrigger>
 <SheetContent>
 <SheetHeader>
 <SheetTitle>Create New Contact</SheetTitle>
 <SheetDescription>
 Fill out the form below to create a new contact.
 </SheetDescription>
 </SheetHeader>
 <div className="space-y-4 py-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Name</label>
 <Input placeholder="John Doe" />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Email</label>
 <Input type="email" placeholder="john@example.com" />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Phone</label>
 <Input type="tel" placeholder="+1 (555) 000-0000" />
 </div>
 </div>
 <SheetFooter>
 <Button variant="outline">Cancel</Button>
 <Button>Create Contact</Button>
 </SheetFooter>
 </SheetContent>
 </Sheet>
 </CardContent>
 </Card>
 </div>
 </section>

 {/* Table Section */}
 <section className="space-y-4">
 <h2 className="text-2xl font-semibold text-foreground">Tables</h2>
 <Card>
 <CardHeader>
 <CardTitle>Data Table</CardTitle>
 <CardDescription>Minimal table design</CardDescription>
 </CardHeader>
 <CardContent>
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Name</TableHead>
 <TableHead>Email</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Amount</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 <TableRow>
 <TableCell className="font-medium">John Doe</TableCell>
 <TableCell>john@example.com</TableCell>
 <TableCell>
 <Badge variant="success">Active</Badge>
 </TableCell>
 <TableCell className="text-right">$1,200.00</TableCell>
 </TableRow>
 <TableRow>
 <TableCell className="font-medium">Jane Smith</TableCell>
 <TableCell>jane@example.com</TableCell>
 <TableCell>
 <Badge variant="warning">Pending</Badge>
 </TableCell>
 <TableCell className="text-right">$850.00</TableCell>
 </TableRow>
 <TableRow>
 <TableCell className="font-medium">Bob Johnson</TableCell>
 <TableCell>bob@example.com</TableCell>
 <TableCell>
 <Badge variant="error">Cancelled</Badge>
 </TableCell>
 <TableCell className="text-right">$0.00</TableCell>
 </TableRow>
 </TableBody>
 </Table>
 </CardContent>
 </Card>
 </section>

 {/* Cards Section */}
 <section className="space-y-4">
 <h2 className="text-2xl font-semibold text-foreground">Cards</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card>
 <CardHeader>
 <CardTitle>Total Revenue</CardTitle>
 <CardDescription>This month</CardDescription>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-bold text-foreground">$45,231.89</p>
 <p className="text-sm text-foreground-secondary mt-1">+20.1% from last month</p>
 </CardContent>
 </Card>
 <Card>
 <CardHeader>
 <CardTitle>Active Jobs</CardTitle>
 <CardDescription>In progress</CardDescription>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-bold text-foreground">12</p>
 <p className="text-sm text-foreground-secondary mt-1">+3 new this week</p>
 </CardContent>
 </Card>
 <Card>
 <CardHeader>
 <CardTitle>Completion Rate</CardTitle>
 <CardDescription>Overall</CardDescription>
 </CardHeader>
 <CardContent>
 <p className="text-3xl font-bold text-foreground">94.3%</p>
 <p className="text-sm text-foreground-secondary mt-1">+2.1% from last month</p>
 </CardContent>
 </Card>
 </div>
 </section>
 </div>
 </div>
 )
}
