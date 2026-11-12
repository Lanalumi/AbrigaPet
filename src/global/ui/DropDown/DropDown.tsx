import { ComponentProps } from 'react'

type DropDownProps = Omit<ComponentProps<'select'>, 'value'> & {
  label?: string
  options: string[]
  value: string[]
  id: string
}

export const DropDown = ({ label, options, value, id, ...selectProps }: DropDownProps) => {
  return (
    <div className="flex w-full max-w-[200px] flex-col gap-1">
      {label && (
        <label className="font-poppins text-xs font-semibold text-[#3A250B]" htmlFor={id}>
          {label}
        </label>
      )}
      <select
        className="h-[42px] w-full cursor-pointer rounded-xl border border-[#755835]/30 bg-[#FDF8F3] px-3 py-2 font-poppins text-xs font-medium text-[#3A250B] outline-none transition-all focus:ring-2 focus:ring-[#755835]/30 disabled:cursor-default"
        {...selectProps}
        id={id}
      >
        {options.map((option, index) => (
          <option key={index} value={value[index]}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
