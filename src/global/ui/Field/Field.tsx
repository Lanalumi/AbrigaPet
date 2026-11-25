import { ComponentProps } from 'react'

type FieldProps = ComponentProps<'input'> & {
  label?: string
  id: string
  type: string
}

export const Field = ({ label, id, type, ...inputProps }: FieldProps) => {
  return (
    <div className="flex w-full flex-col gap-1 max-w-80">
      {label && (
        <label className="font-poppins text-xs font-semibold text-[#3A250B]" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        type={type}
        {...inputProps}
        id={id}
        className="h-[42px] w-full rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3 font-poppins text-xs font-medium text-[#3A250B] outline-none transition-all placeholder:font-medium placeholder:text-[#755835]/60 focus:ring-2 focus:ring-[#755835]/30 disabled:cursor-default"
      />
    </div>
  )
}
