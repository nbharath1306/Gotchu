"use client"

import * as React from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarInputProps {
    name?: string
    required?: boolean
    className?: string
    placeholder?: string
    value?: string
    onChange?: (date: string) => void
}

export function CalendarInput({ name, required, className, placeholder = "Select date", value, onChange }: CalendarInputProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    // Internal state only used if uncontrolled
    const [internalDate, setInternalDate] = React.useState<Date | null>(null)
    const [currentMonth, setCurrentMonth] = React.useState(new Date())

    const containerRef = React.useRef<HTMLDivElement>(null)

    // Derived state
    const date = value ? new Date(value) : internalDate

    // Close on outside click
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleDateClick = (day: Date) => {
        const formatted = format(day, "yyyy-MM-dd")
        if (onChange) {
            onChange(formatted)
        } else {
            setInternalDate(day)
        }
        setIsOpen(false)
    }

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const renderDays = () => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)

        const dateFormat = "d"
        const rows = []
        let days = []
        let day = startDate
        let formattedDate = ""

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat)
                const cloneDay = day
                const isSelected = (date && !isNaN(date.getTime())) ? isSameDay(day, date) : false
                const isCurrentMonth = isSameMonth(day, monthStart)

                days.push(
                    <button
                        key={day.toString()}
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleDateClick(cloneDay) }}
                        className={`
                w-9 h-9 text-xs font-medium rounded-full flex items-center justify-center transition-all
                ${!isCurrentMonth ? "text-gray-300 pointer-events-none" : "text-gray-700 hover:bg-gray-100"}
                ${isSelected ? "bg-[#111111] text-white hover:bg-[#111111] shadow-md" : ""}
            `}
                    >
                        {formattedDate}
                    </button>
                )
                day = addDays(day, 1)
            }
            rows.push(
                <div key={day.toString()} className="flex justify-between mb-1">
                    {days}
                </div>
            )
            days = []
        }
        return <div className="mt-2">{rows}</div>
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Hidden Input for Form Submission */}
            <input
                type="hidden"
                name={name}
                value={date && !isNaN(date.getTime()) ? format(date, "yyyy-MM-dd") : ""}
                required={required}
            />

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
            w-full flex items-center justify-between px-4 py-3.5 bg-white border outline-none transition-all text-left
            ${isOpen ? 'border-gray-400 ring-4 ring-gray-100' : 'border-[#E5E5E5] hover:border-gray-300'}
            ${className?.includes("input-swiss") ? "rounded-none" : "rounded-lg"}
        `}
            >
                <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${date && !isNaN(date.getTime()) ? "text-gray-900" : "text-gray-400"}`}>
                        {date && !isNaN(date.getTime()) ? format(date, "PPP") : placeholder}
                    </span>
                </div>
            </button>

            {/* Popover Calendar */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-xl z-50 w-[300px] animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={(e) => { e.preventDefault(); prevMonth() }} className="p-1 hover:bg-gray-50 rounded-md text-gray-500">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold text-gray-900 tracking-wide">
                            {format(currentMonth, "MMMM yyyy")}
                        </span>
                        <button type="button" onClick={(e) => { e.preventDefault(); nextMonth() }} className="p-1 hover:bg-gray-50 rounded-md text-gray-500">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="flex justify-between mb-2 pb-2 border-b border-gray-50">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="w-9 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    {renderDays()}
                </div>
            )}
        </div>
    )
}
