'use client'

import { Table, TableColumn } from '@/global/ui/Table/Table'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useDeleteClinica } from '../../hooks/useDeleteClinica'
import { Clinica } from '../../types'

type ClinicasTableProps = {
  items: Clinica[]
  loading: boolean
  totalPages: number
  page: number
  onPageChange?: (page: number) => void
  onSortChange?: (sortBy: string, sortDir: 'asc' | 'desc') => void
  currentSort?: { sortBy: string; sortDir: 'asc' | 'desc' }
}

export default function ClinicasTable({
  items,
  loading,
  totalPages,
  page,
  onPageChange,
  onSortChange,
  currentSort,
}: ClinicasTableProps) {
  const deleteClinicaMutation = useDeleteClinica()
  const route = useRouter()

  const onDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return

    deleteClinicaMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Clínica excluída com sucesso')
        route.push('/clinicas')
      },
      onError: () => {
        toast.error('Erro ao excluir clínica')
      },
    })
  }

  const columns: TableColumn<Clinica>[] = [
    {
      key: 'nome',
      label: 'Nome',
      sortable: false, // <-- Remove a setinha de ordenação daqui
    },
    {
      key: 'cnpj',
      label: 'CNPJ',
      sortable: false,
    },
    {
      key: 'telefone',
      label: 'Telefone',
    },
    {
      key: 'cidade',
      label: 'Cidade',
      sortable: false,
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (item) => (
        <div className="flex items-center justify-start gap-3">
          <button
            type="button"
            onClick={() => route.push(`/clinicas/${item.id}`)}
            className="p-2 rounded-xl bg-[#E8F0FE]/60 hover:bg-[#E8F0FE] text-blue-600 transition-all cursor-pointer flex items-center justify-center"
            title="Editar clínica"
          >
            <img src="/images/icons/green-edit-button.svg" alt="Editar" className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            id="delete-button"
            onClick={() => onDelete(item.id)}
            disabled={deleteClinicaMutation.isPending}
            className="p-2 rounded-xl bg-[#FFF0ED]/60 hover:bg-[#FFF0ED] text-red-600 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            title="Excluir clínica"
          >
            {deleteClinicaMutation.isPending ? (
              <span className="text-[10px] font-bold">...</span>
            ) : (
              <img src="/images/icons/red-delete-button.svg" alt="Excluir" className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full">
      <Table
        data={items}
        columns={columns}
        loading={loading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={onPageChange}
        onSortChange={onSortChange}
        currentSort={currentSort}
        getRowKey={(item) => item.id}
      />
    </div>
  )
}