'use client'

import { useId, useState } from 'react'
import { ChevronDownIcon } from './ChevronDownIcon'
import { Button } from '../Button/Button'

export type SummaryTagProps = {
  title: React.ReactNode
  description: React.ReactNode
  defaultExpanded?: boolean
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  className?: string
}

export function SummaryTag({
  title,
  description,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  className = '',
}: SummaryTagProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded)
  const isExpanded = expanded ?? uncontrolledExpanded
  const panelId = useId()
  const buttonId = useId()

  const toggleExpanded = () => {
    const nextExpanded = !isExpanded
    if (expanded === undefined) {
      setUncontrolledExpanded(nextExpanded)
    }
    onExpandedChange?.(nextExpanded)
  }

  return (
    <div className={`cursor-pointer  bg-white/60  ${className}`.trim()}>
      <Button
        variant="transparent"
        id={buttonId}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left focus-visible:outline focus-visible:ring-2 focus-visible:ring-prontera-blue focus-visible:ring-offset-2 focus-visible:ring-offset-prontera-cream"
        onClick={toggleExpanded}
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        <ChevronDownIcon
          className={`text-foreground/70 transition-transform cursor-pointer ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
        />
      </Button>
      {isExpanded ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="px-4 pb-4 pt-0 text-sm leading-relaxed text-foreground/80"
        >
          {description}
        </div>
      ) : null}
    </div>
  )
}
