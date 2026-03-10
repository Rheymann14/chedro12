import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Convert string date to Date object
  const date = value ? new Date(value) : undefined
  
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Format date as YYYY-MM-DD for input compatibility
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      onChange(formattedDate)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 h-120 p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="rounded-md"
        />
      </PopoverContent>
    </Popover>
  )
}
