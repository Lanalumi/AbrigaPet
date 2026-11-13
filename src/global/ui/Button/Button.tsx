type ButtonProps<T extends React.ButtonHTMLAttributes<HTMLButtonElement>> = {
  children: React.ReactNode
  green?: boolean
  yellow?: boolean
  red?: boolean
  icon?: string
  disabled?: boolean
  fill?: boolean
} & T

const coverWrapper = "after:absolute after:inset-0 after:rounded-[10px] after:content-['']"

export const Button = <T extends React.ButtonHTMLAttributes<HTMLButtonElement>>({
  children,
  green,
  yellow,
  red,
  icon,
  disabled,
  fill,
  ...props
}: ButtonProps<T>) => {
  const { className, ...buttonProps } = props
  const extraClass = className ?? ''

  return (
    <>
      {green && (
        <div
          className={`relative flex cursor-pointer flex-row items-center justify-center gap-2 rounded-[10px] bg-[#8AA36C] px-4 py-2 ${fill ? 'w-full max-w-none' : 'md:max-h-10 md:max-w-70'}`}
        >
          <img src={icon} alt="save" width={20} height={20} />
          <button
            {...buttonProps}
            className={`flex cursor-pointer rounded-sm py-2 font-poppins text-[14px] font-semibold text-white focus:outline-none ${coverWrapper} ${fill ? 'px-1 text-center leading-tight' : 'px-4'} ${extraClass}`}
          >
            {children}
          </button>
        </div>
      )}

      {red && (
        <div className="relative bg-[#FFA686] flex flex-row items-center justify-center gap-2 py-2 px-4 rounded-[10px] md:max-w-70 md:max-h-10 cursor-pointer">
          <img src="/images/icons/delete-button.svg" alt="delete" width={24} height={24} />
          <button
            {...buttonProps}
            className={`flex font-poppins font-semibold py-2 px-4 text-[14px] text-white rounded-sm focus:outline-none cursor-pointer ${coverWrapper} ${extraClass}`}
          >
            {children}
          </button>
        </div>
      )}
      {disabled && (
        <div className="relative bg-[#8AA36C] flex flex-row items-center justify-center gap-2 py-2 px-4 rounded-[10px] md:max-w-70 md:max-h-10 cursor-pointer opacity-50 pointer-events-none">
          <img src={icon} alt="save" width={20} height={20} />
          <button
            {...buttonProps}
            className={`flex  font-poppins font-semibold py-2 px-4 text-[14px] text-white rounded-sm focus:outline-none cursor-pointer ${coverWrapper} ${extraClass}`}
          >
            {children}
          </button>
        </div>
      )}
      {!green && !yellow && !red && !disabled && (
        <button
          className="flex font-poppins font-semibold py-2 text-base text-[#755835] bg-transparent  focus:outline-none"
          {...props}
        >
          {children}
        </button>
      )}
    </>
  )
}
