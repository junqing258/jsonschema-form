import { useMemo, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils'

import { Calendar } from '../components/ui/calendar'
import { Button } from '../components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { cn } from '../lib/utils'

const DATE_PATTERN = 'yyyy-MM-dd'

const parseDateValue = (value?: unknown) => {
  if (typeof value !== 'string') return undefined
  const normalized = value.split('T')[0]
  if (!normalized) return undefined
  const [year, month, day] = normalized.split('-').map((part) => Number(part))
  if ([year, month, day].some((part) => Number.isNaN(part))) return undefined
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const formatDateValue = (date?: Date) => (date ? format(date, DATE_PATTERN) : '')

export default function DatePickerWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    required,
    disabled,
    readonly,
    value,
    placeholder,
    options,
    onChange,
    onBlur,
    onFocus,
    rawErrors = [],
    className,
  } = props
  const [open, setOpen] = useState(false)

  const selectedDate = useMemo(() => parseDateValue(value), [value])
  const displayValue = formatDateValue(selectedDate)

  const handleSelect = (date?: Date) => {
    if (!date) {
      onChange(options.emptyValue ?? undefined)
      return
    }
    onChange(formatDateValue(date))
    setOpen(false)
  }

  const triggerDisabled = disabled || readonly

  return (
    <div className='p-0.5'>
      <Popover open={open} onOpenChange={(next) => !triggerDisabled && setOpen(next)}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type='button'
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !displayValue && 'text-muted-foreground',
              rawErrors.length > 0 && 'border-destructive focus-visible:ring-destructive/20',
              className
            )}
            aria-required={required}
            disabled={triggerDisabled}
            onBlur={() => onBlur(id, value)}
            onFocus={() => onFocus(id, value)}
          >
            <CalendarIcon className='mr-2 h-4 w-4 text-muted-foreground' />
            {displayValue || placeholder || '选择日期'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar mode='single' selected={selectedDate} onSelect={handleSelect} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  )
}
