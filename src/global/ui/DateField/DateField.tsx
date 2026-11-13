'use client'

import { ChangeEvent, ComponentProps } from 'react'
import { Field } from '../Field/Field'

export function maskBrDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  if (digits.length <= 2) return day
  if (digits.length <= 4) return `${day}/${month}`
  return `${day}/${month}/${year}`
}

type DateFieldProps = Omit<ComponentProps<typeof Field>, 'type'>

export function DateField({ onChange, placeholder = 'dd/mm/aaaa', ...props }: DateFieldProps) {
  return (
    <Field
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={10}
      placeholder={placeholder}
      {...props}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        event.target.value = maskBrDate(event.target.value)
        onChange?.(event)
      }}
    />
  )
}
