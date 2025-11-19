import { useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils'

import { Button } from '../components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { cn } from '../lib/utils'

const MINUTES_IN_DAY = 24 * 60
const DEFAULT_STEP = 30

const parseStep = (step?: unknown) => {
  if (typeof step === 'number') return step
  if (typeof step === 'string') {
    const parsed = Number(step)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

const clampStep = (step?: number) => {
  if (!step || Number.isNaN(step)) return DEFAULT_STEP
  return Math.min(Math.max(Math.round(step), 1), 120)
}

const generateTimeOptions = (step: number) => {
  const options: string[] = []
  for (let minutes = 0; minutes < MINUTES_IN_DAY; minutes += step) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    options.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
  }
  return options
}

const normalizeDisplayValue = (value?: unknown) => {
  if (typeof value !== 'string') return ''
  const [hour = '00', minute = '00'] = value.split(':')
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

export default function TimePickerWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    placeholder,
    options,
    className,
    rawErrors = [],
    onBlur,
    onFocus,
    onChange,
  } = props
  const triggerDisabled = disabled || readonly
  const [open, setOpen] = useState(false)

  const normalizedValue = normalizeDisplayValue(value)
  const timeStep = clampStep(parseStep((options as Record<string, unknown>)?.step))
  const timeOptions = useMemo(() => {
    const base = generateTimeOptions(timeStep)
    if (normalizedValue && !base.includes(normalizedValue)) {
      return [normalizedValue, ...base]
    }
    return base
  }, [timeStep, normalizedValue])

  const commitChange = (next?: string) => {
    if (!next) {
      onChange(options.emptyValue ?? undefined)
      return
    }
    onChange(`${next}:00`)
  }

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
              !normalizedValue && 'text-muted-foreground',
              rawErrors.length > 0 && 'border-destructive focus-visible:ring-destructive/20',
              className
            )}
            disabled={triggerDisabled}
            aria-required={required}
            onBlur={() => onBlur(id, value)}
            onFocus={() => onFocus(id, value)}
          >
            <Clock className='mr-2 h-4 w-4 text-muted-foreground' />
            {normalizedValue || placeholder || '选择时间'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-60 p-0' align='start'>
          <Command>
            <CommandInput placeholder='搜索时间' />
            <CommandList>
              <CommandEmpty>未找到匹配时间</CommandEmpty>
              {!required && (
                <CommandGroup heading='操作'>
                  <CommandItem
                    value='clear'
                    onSelect={() => {
                      commitChange()
                      setOpen(false)
                    }}
                  >
                    清除
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup heading='可选时间'>
                {timeOptions.map((time) => (
                  <CommandItem
                    key={time}
                    value={time}
                    onSelect={(currentValue) => {
                      commitChange(currentValue)
                      setOpen(false)
                    }}
                  >
                    {time}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
