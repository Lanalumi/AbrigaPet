-- AlterTable
ALTER TABLE "Pessoa" ADD COLUMN     "email" TEXT,
ADD COLUMN     "senhaHash" TEXT;

-- AlterTable
ALTER TABLE "TipoPessoa" DROP COLUMN "email",
DROP COLUMN "senha";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "RedefinicaoSenha" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "RedefinicaoSenha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RedefinicaoSenha_tokenHash_idx" ON "RedefinicaoSenha"("tokenHash");

-- Login emails are unique only for accounts that can sign in.
-- Adotante rows keep senhaHash null, so their contact emails stay out of this index.
CREATE UNIQUE INDEX "Pessoa_email_login_key" ON "Pessoa" ("email") WHERE "senhaHash" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "RedefinicaoSenha" ADD CONSTRAINT "RedefinicaoSenha_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
