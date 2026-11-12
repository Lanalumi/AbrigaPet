import { FormNewPerson } from '@/modules/pessoas/components/FormNewPerson/FormNewPerson'

export default function NewAdotantePage() {
  return (
    <div className="flex flex-col max-w-[94%] justify-center items-center p-4">
      <header className="flex w-full max-w-full flex-col p-4 gap-2 bg-[#FFF9F7] ">
        <h1 className="text-center font-poppins text-[#755835] font-semibold">Cadastro de adotante</h1>
      </header>
      <FormNewPerson role="adotante" />
    </div>
  )
}
