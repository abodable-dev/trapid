import { useState, useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

export default function CalendarPicker({ value, onChange, label }) {
 const [currentMonth, setCurrentMonth] = useState(() => {
 if (value) {
 const date = new Date(value)
 return new Date(date.getFullYear(), date.getMonth(), 1)
 }
 return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
 })

 const selectedDate = value ? new Date(value) : null

 // Generate calendar days for current month
 const days = useMemo(() => {
 const year = currentMonth.getFullYear()
 const month = currentMonth.getMonth()

 // First day of the month
 const firstDay = new Date(year, month, 1)
 // Last day of the month
 const lastDay = new Date(year, month + 1, 0)

 // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
 const firstDayOfWeek = firstDay.getDay()
 // Adjust so Monday is 0 (we want week to start on Monday)
 const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

 // Days from previous month to show
 const prevMonthDays = adjustedFirstDay
 const prevMonth = new Date(year, month, 0)
 const prevMonthLastDate = prevMonth.getDate()

 const calendarDays = []

 // Previous month days
 for (let i = prevMonthDays - 1; i >= 0; i--) {
 const date = new Date(year, month - 1, prevMonthLastDate - i)
 calendarDays.push({
 date: formatDate(date),
 isCurrentMonth: false,
 isToday: isToday(date),
 isSelected: selectedDate && isSameDay(date, selectedDate),
 })
 }

 // Current month days
 for (let i = 1; i <= lastDay.getDate(); i++) {
 const date = new Date(year, month, i)
 calendarDays.push({
 date: formatDate(date),
 isCurrentMonth: true,
 isToday: isToday(date),
 isSelected: selectedDate && isSameDay(date, selectedDate),
 })
 }

 // Next month days to fill grid
 const remainingDays = 42 - calendarDays.length // 6 rows * 7 days
 for (let i = 1; i <= remainingDays; i++) {
 const date = new Date(year, month + 1, i)
 calendarDays.push({
 date: formatDate(date),
 isCurrentMonth: false,
 isToday: isToday(date),
 isSelected: selectedDate && isSameDay(date, selectedDate),
 })
 }

 return calendarDays
 }, [currentMonth, selectedDate])

 const formatDate = (date) => {
 const year = date.getFullYear()
 const month = String(date.getMonth() + 1).padStart(2, '0')
 const day = String(date.getDate()).padStart(2, '0')
 return `${year}-${month}-${day}`
 }

 const isToday = (date) => {
 const today = new Date()
 return isSameDay(date, today)
 }

 const isSameDay = (date1, date2) => {
 return (
 date1.getFullYear() === date2.getFullYear() &&
 date1.getMonth() === date2.getMonth() &&
 date1.getDate() === date2.getDate()
 )
 }

 const handlePrevMonth = () => {
 setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
 }

 const handleNextMonth = () => {
 setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
 }

 const handleDateClick = (dateString) => {
 onChange(dateString)
 }

 const monthNames = [
 'January', 'February', 'March', 'April', 'May', 'June',
 'July', 'August', 'September', 'October', 'November', 'December'
 ]

 return (
 <div>
 {label && (
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 {label}
 </label>
 )}
 <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4">
 <div className="flex items-center text-gray-900 dark:text-white mb-4">
 <button
 type="button"
 onClick={handlePrevMonth}
 className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white"
 >
 <span className="sr-only">Previous month</span>
 <ChevronLeftIcon aria-hidden="true" className="size-5" />
 </button>
 <div className="flex-auto text-sm font-semibold text-center">
 {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
 </div>
 <button
 type="button"
 onClick={handleNextMonth}
 className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-white"
 >
 <span className="sr-only">Next month</span>
 <ChevronRightIcon aria-hidden="true" className="size-5" />
 </button>
 </div>
 <div className="grid grid-cols-7 text-xs/6 text-gray-500 dark:text-gray-400 text-center mb-2">
 <div>M</div>
 <div>T</div>
 <div>W</div>
 <div>T</div>
 <div>F</div>
 <div>S</div>
 <div>S</div>
 </div>
 <div className="isolate grid grid-cols-7 gap-px bg-gray-200 text-sm shadow ring-1 ring-gray-200 dark:bg-white/15 dark:shadow-none dark:ring-white/15">
 {days.map((day, index) => (
 <button
 key={day.date}
 type="button"
 onClick={() => handleDateClick(day.date)}
 data-is-today={day.isToday ? '' : undefined}
 data-is-selected={day.isSelected ? '' : undefined}
 data-is-current-month={day.isCurrentMonth ? '' : undefined}
 className="py-1.5 first: last: hover:bg-gray-100 focus:z-10 data-[is-current-month]:bg-white data-[is-selected]:font-semibold data-[is-today]:font-semibold data-[is-selected]:text-white data-[is-current-month]:hover:bg-gray-100 dark:hover:bg-gray-900/25 dark:data-[is-current-month]:bg-gray-900/90 dark:data-[is-selected]:text-gray-900 dark:data-[is-current-month]:hover:bg-gray-900/50 [&:not([data-is-current-month])]:bg-gray-50 dark:[&:not([data-is-current-month])]:bg-gray-900/75 data-[is-today]:[&:not([data-is-selected])]:text-indigo-600 dark:data-[is-today]:[&:not([data-is-selected])]:text-indigo-400 [&:not([data-is-selected])]:data-[is-current-month]:[&:not([data-is-today])]:text-gray-900 dark:[&:not([data-is-selected])]:data-[is-current-month]:[&:not([data-is-today])]:text-white [&:not([data-is-selected])]:[&:not([data-is-current-month])]:[&:not([data-is-today])]:text-gray-400 dark:[&:not([data-is-selected])]:[&:not([data-is-current-month])]:[&:not([data-is-today])]:text-gray-500 [&:nth-child(36)]: [&:nth-child(7)]:"
 >
 <time
 dateTime={day.date}
 className="mx-auto flex size-7 items-center justify-center rounded-full [[data-is-selected]_&]:[&:not([data-is-today]_*)]:bg-gray-900 dark:[[data-is-selected]_&]:[&:not([data-is-today]_*)]:bg-white [[data-is-selected]_&]:[[data-is-today]_&]:bg-indigo-600 dark:[[data-is-selected]_&]:[[data-is-today]_&]:bg-indigo-500"
 >
 {day.date.split('-').pop().replace(/^0/, '')}
 </time>
 </button>
 ))}
 </div>
 </div>
 </div>
 )
}
