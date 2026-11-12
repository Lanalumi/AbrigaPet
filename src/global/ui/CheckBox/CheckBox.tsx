'use client'

import { useState } from 'react'

type CheckBoxOption = {
  label: string
  value: string
  checked?: boolean
}

type CheckBoxProps = {
  id: string
  title: string
  options: CheckBoxOption[]
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
}

export const CheckBox = ({ id, title, options, value, onChange, onBlur }: CheckBoxProps) => {
  const [internalValue, setInternalValue] = useState(() => options.find((option) => option.checked)?.value ?? '')

  const isControlled = value !== undefined
  const selected = isControlled ? value : internalValue

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onChange?.(nextValue)
  }

  return (
    <div className=" flex flex-col w-full max-w-full">
      {title && <h3 className="font-poppins font-semibold py-2 px-4 text-base text-[#755835]">{title}</h3>}
      <div className="flex flex-wrap gap-2 w-full max-w-full">
        {options.map((option) => {
          const inputId = `${id}-${option.value}`

          return (
            <div key={option.value} className="flex flex-wrap items-center gap-2 min-w-0">
              <label className="font-poppins font-semibold py-2 px-4 text-base text-[#755835]" htmlFor={inputId}>
                {option.label}
              </label>
              <input
                id={inputId}
                type="checkbox"
                checked={selected === option.value}
                onChange={(event) => {
                  updateValue(event.target.checked ? option.value : '')
                  onBlur?.()
                }}
                className="font-poppins font-semibold text-base text-[#755835] rounded-sm p-2 focus:outline-none"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
