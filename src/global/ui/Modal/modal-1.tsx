'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

type ModalProps = {
  title: string
  body: React.ReactNode
  openButtonText?: string
  isOpen?: boolean
  onClose?: () => void
}

const escapeClosers: Array<() => void> = []

const panelClasses =
  'fixed left-1/2 top-1/2 z-[70] flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg min-w-0 -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-[#3A250B]/30 bg-white shadow-[2px_8px_24px_rgba(58,37,11,0.18)] transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform] p-4 overflow-y-auto overflow-x-hidden'

export const Modal = ({ title, body, openButtonText, isOpen: isOpenProp, onClose }: ModalProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const open = isOpenProp ?? internalIsOpen

  function handleClose() {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!open) return

    function close() {
      if (onClose) {
        onClose()
      } else {
        setInternalIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (escapeClosers[escapeClosers.length - 1] !== close) return
      event.preventDefault()
      close()
    }

    escapeClosers.push(close)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const index = escapeClosers.indexOf(close)
      if (index >= 0) escapeClosers.splice(index, 1)
    }
  }, [open, onClose])

  const overlay = (
    <div
      className={`fixed inset-0 z-[60] bg-[#3A250B]/40 transition-opacity duration-300 ease-out ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={handleClose}
      aria-hidden={!open}
    />
  )

  const panel = (
    <div
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      className={`${panelClasses} ${open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
    >
      <header className="relative flex min-w-0 flex-row items-center justify-center p-4 pr-12 max-w-full">
        <h1 className="min-w-0 w-full max-w-[calc(100%-3rem)] wrap-break-word text-center font-poppins text-2xl font-bold leading-snug text-[#755835]">
          {title}
        </h1>
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-0 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-md p-4 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#8AA36C] focus-visible:ring-offset-2"
        >
          <Image src="/images/close.svg" alt="Close Modal" width={18} height={18} className="cursor-pointer" />
        </button>
      </header>
      <main className="flex w-full min-w-0 max-w-full flex-col items-stretch p-4 sm:p-8">
        <div className="w-full min-w-0 max-w-full wrap-break-word">{body}</div>
      </main>
    </div>
  )

  return (
    <div>
      {openButtonText && (
        <button
          type="button"
          onClick={() => setInternalIsOpen(true)}
          className="font-poppins text-sm font-semibold text-[#8AA36C] underline decoration-[#8AA36C] decoration-2 underline-offset-4 hover:text-[#755835] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#8AA36C] focus-visible:ring-offset-2"
        >
          {openButtonText}
        </button>
      )}

      {portalReady
        ? createPortal(
            <>
              {overlay}
              {panel}
            </>,
            document.body,
          )
        : null}
    </div>
  )
}
