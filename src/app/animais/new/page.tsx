import { FormNewAnimal } from '@/modules/animais/componentes/FormNewAnimal/FormNewAnimal'

export default function NewAnimalPage() {
  return (
    <div className="flex flex-col max-w-[94%] justify-center items-center p-4">
      <header className="flex w-full max-w-full flex-col p-4 gap-2 bg-[#FFF9F7] ">
        <h1 className="text-center font-poppins text-[#755835] font-semibold">Cadastro de Animal</h1>
        <div className="flex w-full max-w-full flex-row items-center justify-center gap-2 text-center">
          <img src="/images/icons/paw.svg" alt="animal" width={24} height={24} />
          <span className="font-poppins font-semibold text-[#755835]">Novo Animal</span>
        </div>
      </header>
      <FormNewAnimal />
    </div>
  )
}
