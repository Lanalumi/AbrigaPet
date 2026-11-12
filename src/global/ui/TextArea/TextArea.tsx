import { TextareaHTMLAttributes } from 'react'

type TextAreaProps = {
  label?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export const TextArea = ({ label, id, placeholder, ...props }: TextAreaProps) => {
  return (
    <div className="flex w-80 flex-col">
      {label && (
        <label className="font-poppins font-semibold py-2 px-4 text-base text-[#755835]" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        className="w-full text-[#755835] bg-[#FFF9F7] border border-[#3A250B]/30 rounded-md p-2 focus:outline-none font-poppins font-semibold text-base resize-none h-20"
        id={id}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}
