import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  History,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProdutoForm } from '@/components/shared/ProdutoForm'
import { MovimentacaoRapidaForm } from '@/components/shared/MovimentacaoRapidaForm'
import { useProdutosStore } from '@/stores/produtosStore'
import { useMovimentacoesStore } from '@/stores/movimentacoesStore'
import { formatDate } from '@/lib/utils'
import { UNIDADE_LABEL, type Produto } from '@/types'

type ModalState =
  | { type: 'none' }
  | { type: 'novo' }
  | { type: 'editar'; produto: Produto }
  | { type: 'entrada'; produto: Produto }
  | { type: 'saida'; produto: Produto }
  | { type: 'historico'; produto: Produto }
  | { type: 'excluir'; produto: Produto }

export function AlmoxarifadoPage() {
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const todosProdutos = useProdutosStore((s) => s.produtos)
  const produtos = useMemo(() => todosProdutos.filter((p) => p.setor === 'almoxarifado'), [todosProdutos])
  const adicionarProduto = useProdutosStore((s) => s.adicionar)
  const editarProduto = useProdutosStore((s) => s.editar)
  const removerProduto = useProdutosStore((s) => s.remover)

  const registrarEntrada = useMovimentacoesStore((s) => s.registrarEntrada)
  const registrarSaida = useMovimentacoesStore((s) => s.registrarSaida)
  const todasMovimentacoes = useMovimentacoesStore((s) => s.movimentacoes)
  const getPorProduto = useMovimentacoesStore((s) => s.getPorProduto)

  const produtosFiltrados = useMemo(
    () => produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())),
    [produtos, busca]
  )

  // Garante que o histórico reaja a mudanças nas movimentações
  void todasMovimentacoes

  const fechar = () => setModal({ type: 'none' })

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            className="w-full h-10 bg-surface-800 border border-surface-600 rounded-lg pl-9 pr-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button onClick={() => setModal({ type: 'novo' })}>
          <Plus size={16} />
          Novo produto
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-surface-800 text-center">
          <p className="text-xl font-bold text-surface-50">{produtos.length}</p>
          <p className="text-xs text-surface-500 mt-0.5">Produtos</p>
        </div>
        <div className="p-3 rounded-lg bg-surface-800 text-center">
          <p className="text-xl font-bold text-emerald-400">
            {produtos.reduce((a, p) => a + p.quantidadeAtual, 0)}
          </p>
          <p className="text-xs text-surface-500 mt-0.5">Itens em estoque</p>
        </div>
        <div className="p-3 rounded-lg bg-surface-800 text-center">
          <p className="text-xl font-bold text-amber-400">
            {produtos.filter((p) => p.quantidadeAtual <= p.quantidadeMinima).length}
          </p>
          <p className="text-xs text-surface-500 mt-0.5">Estoque baixo</p>
        </div>
      </div>

      {/* Lista de produtos */}
      {produtosFiltrados.length === 0 ? (
        <EmptyState
          icon={Package}
          title={busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          description={busca ? `Nenhum resultado para "${busca}"` : 'Adicione o primeiro produto do almoxarifado.'}
          action={
            !busca ? (
              <Button onClick={() => setModal({ type: 'novo' })}>
                <Plus size={16} /> Adicionar produto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {produtosFiltrados.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onEntrada={() => setModal({ type: 'entrada', produto })}
              onSaida={() => setModal({ type: 'saida', produto })}
              onEditar={() => setModal({ type: 'editar', produto })}
              onExcluir={() => setModal({ type: 'excluir', produto })}
              onHistorico={() => setModal({ type: 'historico', produto })}
            />
          ))}
        </div>
      )}

      {/* Modal Novo produto */}
      <Modal
        open={modal.type === 'novo'}
        onClose={fechar}
        title="Novo produto"
        description="Adicionar produto ao almoxarifado"
      >
        <ProdutoForm
          setor="almoxarifado"
          onSubmit={async (dados) => {
            await adicionarProduto({ ...dados, setor: 'almoxarifado' })
            fechar()
          }}
          onCancel={fechar}
        />
      </Modal>

      {/* Modal Editar */}
      {modal.type === 'editar' && (
        <Modal open onClose={fechar} title="Editar produto">
          <ProdutoForm
            setor="almoxarifado"
            initial={modal.produto}
            onSubmit={async (dados) => {
              await editarProduto(modal.produto.id, dados)
              fechar()
            }}
            onCancel={fechar}
          />
        </Modal>
      )}

      {/* Modal Entrada */}
      {modal.type === 'entrada' && (
        <Modal open onClose={fechar} title="Registrar entrada" description={modal.produto.nome}>
          <MovimentacaoRapidaForm
            produto={modal.produto}
            tipo="entrada"
            onSubmit={async (dados) => {
              await registrarEntrada({ ...dados, produtoId: modal.produto.id, setor: 'almoxarifado' })
              fechar()
            }}
            onCancel={fechar}
          />
        </Modal>
      )}

      {/* Modal Saída */}
      {modal.type === 'saida' && (
        <Modal open onClose={fechar} title="Registrar saída" description={modal.produto.nome}>
          <MovimentacaoRapidaForm
            produto={modal.produto}
            tipo="saida"
            onSubmit={async (dados) => {
              await registrarSaida({ ...dados, produtoId: modal.produto.id, setor: 'almoxarifado' })
              fechar()
            }}
            onCancel={fechar}
          />
        </Modal>
      )}

      {/* Modal Histórico */}
      {modal.type === 'historico' && (
        <Modal
          open
          onClose={fechar}
          title={`Histórico — ${modal.produto.nome}`}
          size="lg"
        >
          <HistoricoMovimentacoes
            movimentacoes={getPorProduto(modal.produto.id)}
          />
        </Modal>
      )}

      {/* Confirmar exclusão */}
      {modal.type === 'excluir' && (
        <ConfirmDialog
          open
          onClose={fechar}
          onConfirm={async () => {
            await removerProduto(modal.produto.id)
            fechar()
          }}
          title="Excluir produto"
          description={`Tem certeza que deseja excluir "${modal.produto.nome}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
        />
      )}
    </div>
  )
}

function ProdutoCard({
  produto,
  onEntrada,
  onSaida,
  onEditar,
  onExcluir,
  onHistorico,
}: {
  produto: Produto
  onEntrada: () => void
  onSaida: () => void
  onEditar: () => void
  onExcluir: () => void
  onHistorico: () => void
}) {
  const abaixoMinimo = produto.quantidadeAtual <= produto.quantidadeMinima

  return (
    <Card variant="bordered" className={abaixoMinimo ? 'border-amber-800/60' : ''}>
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-surface-100 truncate">{produto.nome}</h3>
            {abaixoMinimo && (
              <AlertTriangle size={13} className="text-amber-400 shrink-0" />
            )}
          </div>
          {produto.descricao && (
            <p className="text-xs text-surface-500 mt-0.5 truncate">{produto.descricao}</p>
          )}
        </div>
        <div className="flex gap-1 ml-2 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={onHistorico} title="Ver histórico">
            <History size={14} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onEditar} title="Editar">
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onExcluir} title="Excluir" className="hover:text-red-400">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className={`text-2xl font-bold ${abaixoMinimo ? 'text-amber-400' : 'text-surface-50'}`}>
            {produto.quantidadeAtual}
          </p>
          <p className="text-xs text-surface-500">{UNIDADE_LABEL[produto.unidade]}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-surface-500">Mín: {produto.quantidadeMinima}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="success" size="sm" className="flex-1" onClick={onEntrada}>
          <TrendingUp size={13} /> Entrada
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1"
          onClick={onSaida}
          disabled={produto.quantidadeAtual === 0}
        >
          <TrendingDown size={13} /> Saída
        </Button>
      </div>
    </Card>
  )
}

function HistoricoMovimentacoes({ movimentacoes }: { movimentacoes: ReturnType<typeof useMovimentacoesStore.getState>['movimentacoes'] }) {
  if (movimentacoes.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sem movimentações"
        description="Nenhuma movimentação registrada para este produto."
      />
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {movimentacoes.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between p-3 rounded-lg bg-surface-700"
        >
          <div>
            <p className="text-sm text-surface-200">
              {formatDate(m.data)}
            </p>
            {m.observacao && (
              <p className="text-xs text-surface-500 mt-0.5">{m.observacao}</p>
            )}
          </div>
          <Badge variant={m.tipo === 'entrada' ? 'success' : 'danger'}>
            {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
          </Badge>
        </div>
      ))}
    </div>
  )
}
