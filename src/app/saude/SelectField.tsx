import { ComponentProps } from 'react'

type SelectFieldProps = {
  label: string
} & ComponentProps<'select'>

export function SelectField({ label, id, children, ...props }: SelectFieldProps) {
  return (
    <div className="flex max-w-60 flex-col">
      <label className="font-poppins text-base font-semibold text-[#755835]" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-md border border-[#3A250B]/30 bg-[#FFF9F7] p-2 font-poppins text-base font-semibold text-[#755835] focus:outline-none"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
