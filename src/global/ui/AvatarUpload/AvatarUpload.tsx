'use client'

import { useId, useRef, useState } from 'react'

type AvatarUploadProps = {
  label?: string
  id?: string
  value?: string
  disabled?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export const AvatarUpload = ({ label = 'Foto', id, value, disabled = false, onChange, onBlur }: AvatarUploadProps) => {
  const generatedId = useId()
  const inputId = id ?? `avatar-${generatedId}`
  const inputRef = useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = useState('')

  const isControlled = value !== undefined
  const foto = isControlled ? value : internalValue
  const preview = foto || null

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onChange?.(nextValue)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const dataUrl = await readFileAsDataUrl(file)
    updateValue(dataUrl)
    onBlur?.()
  }

  const handleRemove = () => {
    updateValue('')
    onBlur?.()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex max-w-60 flex-col items-center gap-2">
      {label && <span className="font-poppins font-semibold text-base text-[#755835]">{label}</span>}

      <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-md border border-dashed border-[#3A250B]/30 bg-[#FFF9F7]">
        {preview ? (
          <img src={preview} alt="Pré-visualização da foto do animal" className="h-full w-full object-cover" />
        ) : (
          <img src="/images/icons/paw.svg" alt="" className="h-8 w-8 opacity-50" aria-hidden />
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={handleFileChange}
      />

      {!disabled && (
        <div className="flex flex-wrap justify-center gap-2">
          <label
            htmlFor={inputId}
            className="cursor-pointer font-poppins text-sm font-semibold text-[#755835] underline-offset-2 hover:underline"
          >
            {preview ? 'Trocar foto' : 'Adicionar foto'}
          </label>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer font-poppins text-sm font-semibold text-[#B85454] underline-offset-2 hover:underline"
            >
              Remover
            </button>
          )}
        </div>
      )}
    </div>
  )
}
