import { ComponentProps, Fragment, ReactNode, JSX } from 'react'
import clsx from 'clsx'
import './Table.style.css'

export interface TableColumn<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => ReactNode
}

export interface TableProps<T> extends ComponentProps<'div'> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onSortChange?: (sortBy: string, sortDir: 'asc' | 'desc') => void
  currentSort?: { sortBy: string; sortDir: 'asc' | 'desc' }
  getRowKey: (item: T) => string
}

function renderPaginationControls(totalPages: number, currentPage: number, onPageChange?: (page: number) => void) {
  if (totalPages <= 1) return null

  const pages: JSX.Element[] = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange?.(i)}
        disabled={i === currentPage}
        className={clsx('table-pagination-button', {
          'table-pagination-button--active': i === currentPage,
        })}
      >
        {i}
      </button>,
    )
  }

  return (
    <div className="table-pagination">
      <button
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="table-pagination-button cursor-pointer"
      >
        Previous
      </button>
      {pages}
      <button
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="table-pagination-button"
      >
        Next
      </button>
    </div>
  )
}

function renderSortableHeader<T>(
  column: TableColumn<T>,
  onSortChange: TableProps<T>['onSortChange'],
  currentSort: TableProps<T>['currentSort'],
) {
  if (!column.sortable || !onSortChange) {
    return <th className="table-header">{column.label}</th>
  }

  const isActive = currentSort?.sortBy === column.key
  const isDesc = currentSort?.sortDir === 'desc'

  const handleSort = () => {
    const newSortDir = isActive && isDesc ? 'asc' : 'desc'
    onSortChange(column.key, newSortDir)
  }

  return (
    <th className="table-header table-header--sortable" onClick={handleSort}>
      {column.label} {isActive && (isDesc ? '↓' : '↑')}
    </th>
  )
}

export function Table<T>({
  data,
  columns,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onSortChange,
  currentSort,
  getRowKey,
  className,
  ...divProps
}: TableProps<T>) {
  const tableClasses = clsx('table-container', className)

  return (
    <div className={tableClasses} {...divProps}>
      {loading && <div className="table-loading">Loading...</div>}

      {data.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <Fragment key={column.key}>{renderSortableHeader(column, onSortChange, currentSort)}</Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={getRowKey(item)} className="table-row">
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {column.render ? column.render(item) : String(item[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {renderPaginationControls(totalPages, currentPage, onPageChange)}
    </div>
  )
}
