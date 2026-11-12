import { ComponentProps } from 'react'

type FieldProps = ComponentProps<'input'> & {
  label?: string
  id: string
  type: string
}

export const Field = ({ label, id, type, ...inputProps }: FieldProps) => {
  return (
    <div className="flex flex-col max-w-60">
      {label && (
        <label className="font-poppins font-semibold text-base text-[#755835]" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        className="w-full max-w-full text-[#755835] bg-[#FFF9F7] border border-[#3A250B]/30 rounded-md focus:outline-none font-poppins font-semibold text-base"
        id={id}
        type={type}
        {...inputProps}
      />
    </div>
  )
}
