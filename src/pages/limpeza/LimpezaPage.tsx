import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Sparkles,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  History,
  AlertTriangle,
  Calendar,
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
import { useAcontecimentosStore } from '@/stores/acontecimentosStore'
import { formatDate } from '@/lib/utils'
import { TIPO_ACONTECIMENTO_LABEL, UNIDADE_LABEL, type Produto } from '@/types'

type Tab = 'estoque' | 'saidas'

type ModalState =
  | { type: 'none' }
  | { type: 'novo' }
  | { type: 'editar'; produto: Produto }
  | { type: 'entrada'; produto: Produto }
  | { type: 'saida'; produto: Produto }
  | { type: 'historico'; produto: Produto }
  | { type: 'excluir'; produto: Produto }
  | { type: 'excluir-mov'; id: string }

export function LimpezaPage() {
  const [tab, setTab] = useState<Tab>('estoque')
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  const todosProdutos = useProdutosStore((s) => s.produtos)
  const produtos = useMemo(() => todosProdutos.filter((p) => p.setor === 'limpeza'), [todosProdutos])
  const adicionarProduto = useProdutosStore((s) => s.adicionar)
  const editarProduto = useProdutosStore((s) => s.editar)
  const removerProduto = useProdutosStore((s) => s.remover)

  const registrarEntrada = useMovimentacoesStore((s) => s.registrarEntrada)
  const registrarSaida = useMovimentacoesStore((s) => s.registrarSaida)
  const removerMovimentacao = useMovimentacoesStore((s) => s.remover)
  const getPorProduto = useMovimentacoesStore((s) => s.getPorProduto)
  const todasMovimentacoes = useMovimentacoesStore((s) => s.movimentacoes)
  const todosAcontecimentos = useAcontecimentosStore((s) => s.acontecimentos)
  const saidas = useMemo(
    () => todasMovimentacoes.filter((m) => m.setor === 'limpeza' && m.tipo === 'saida'),
    [todasMovimentacoes]
  )

  const produtosFiltrados = useMemo(
    () => produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())),
    [produtos, busca]
  )

  const saidasFiltradas = useMemo(
    () =>
      saidas.filter(
        (m) =>
          (produtos.find((p) => p.id === m.produtoId)?.nome ?? '')
            .toLowerCase()
            .includes(busca.toLowerCase()) ||
          (m.nomeAcontecimento ?? '').toLowerCase().includes(busca.toLowerCase())
      ),
    [saidas, busca, produtos]
  )

  const fechar = () => setModal({ type: 'none' })

  return (
    <div className="space-y-5">
      {/* Tabs + Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex rounded-lg bg-surface-800 border border-surface-700 p-1 gap-1">
          <TabButton active={tab === 'estoque'} onClick={() => setTab('estoque')}>
            <Sparkles size={14} /> Estoque
          </TabButton>
          <TabButton active={tab === 'saidas'} onClick={() => setTab('saidas')}>
            <Calendar size={14} /> Saídas
          </TabButton>
        </div>

        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            className="w-full h-10 bg-surface-800 border border-surface-600 rounded-lg pl-9 pr-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            placeholder={tab === 'estoque' ? 'Buscar produto...' : 'Buscar por produto ou evento...'}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {tab === 'estoque' && (
          <Button onClick={() => setModal({ type: 'novo' })}>
            <Plus size={16} />
            Novo produto
          </Button>
        )}
      </div>

      {/* Resumo */}
      {tab === 'estoque' && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-surface-800 text-center">
            <p className="text-xl font-bold text-surface-50">{produtos.length}</p>
            <p className="text-xs text-surface-500 mt-0.5">Produtos</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-800 text-center">
            <p className="text-xl font-bold text-cyan-400">
              {produtos.reduce((a, p) => a + p.quantidadeAtual, 0)}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">Em estoque</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-800 text-center">
            <p className="text-xl font-bold text-amber-400">
              {produtos.filter((p) => p.quantidadeAtual <= p.quantidadeMinima).length}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">Estoque baixo</p>
          </div>
        </div>
      )}

      {/* Aba Estoque */}
      {tab === 'estoque' && (
        <>
          {produtosFiltrados.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={busca ? 'Nenhum produto encontrado' : 'Nenhum produto de limpeza cadastrado'}
              description={busca ? `Nenhum resultado para "${busca}"` : 'Adicione o primeiro produto de limpeza.'}
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
                <LimpezaCard
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
        </>
      )}

      {/* Aba Saídas */}
      {tab === 'saidas' && (
        <>
          {saidasFiltradas.length === 0 ? (
            <EmptyState
              icon={TrendingDown}
              title="Nenhuma saída registrada"
              description="As saídas do estoque de limpeza aparecerão aqui com o acontecimento vinculado."
            />
          ) : (
            <div className="space-y-2">
              {saidasFiltradas.map((m) => {
                const produto = produtos.find((p) => p.id === m.produtoId)
                return (
                  <Card key={m.id} variant="bordered" className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-surface-200">
                          {produto?.nome ?? 'Produto removido'}
                        </p>
                        <Badge variant="danger">-{m.quantidade} {produto ? UNIDADE_LABEL[produto.unidade] : ''}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-surface-500">{formatDate(m.data)}</span>
                        {(() => {
                          const ac = m.acontecimentoId
                            ? todosAcontecimentos.find((a) => a.id === m.acontecimentoId)
                            : undefined
                          const tipo = ac?.tipo ?? m.tipoAcontecimento
                          const nome = ac?.nome ?? m.nomeAcontecimento
                          return (
                            <>
                              {tipo && (
                                <Badge variant="purple" className="text-xs">
                                  {TIPO_ACONTECIMENTO_LABEL[tipo]}
                                </Badge>
                              )}
                              {nome && (
                                <span className="text-xs text-surface-400">{nome}</span>
                              )}
                            </>
                          )
                        })()}
                        {m.responsavel && (
                          <span className="text-xs text-surface-500">por {m.responsavel}</span>
                        )}
                      </div>
                      {m.observacao && (
                        <p className="text-xs text-surface-500 mt-0.5 italic">{m.observacao}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:text-red-400 shrink-0"
                      onClick={() => setModal({ type: 'excluir-mov', id: m.id })}
                      title="Remover saída"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Modais */}
      <Modal open={modal.type === 'novo'} onClose={fechar} title="Novo produto de limpeza">
        <ProdutoForm
          setor="limpeza"
          onSubmit={async (dados) => {
            await adicionarProduto({ ...dados, setor: 'limpeza' })
            fechar()
          }}
          onCancel={fechar}
        />
      </Modal>

      {modal.type === 'editar' && (
        <Modal open onClose={fechar} title="Editar produto">
          <ProdutoForm
            setor="limpeza"
            initial={modal.produto}
            onSubmit={async (dados) => {
              await editarProduto(modal.produto.id, dados)
              fechar()
            }}
            onCancel={fechar}
          />
        </Modal>
      )}

      {modal.type === 'entrada' && (
        <Modal open onClose={fechar} title="Registrar entrada" description={modal.produto.nome}>
          <MovimentacaoRapidaForm
            produto={modal.produto}
            tipo="entrada"
            onSubmit={async (dados) => {
              await registrarEntrada({ ...dados, produtoId: modal.produto.id, setor: 'limpeza' })
              fechar()
            }}
            onCancel={fechar}
          />
        </Modal>
      )}

      {modal.type === 'saida' && (
        <Modal open onClose={fechar} title="Registrar saída" description={modal.produto.nome}>
          <MovimentacaoRapidaForm
            produto={modal.produto}
            tipo="saida"
            showAcontecimento
            onSubmit={async (dados) => {
              await registrarSaida({ ...dados, produtoId: modal.produto.id, setor: 'limpeza' })
              fechar()
            }}
            onCancel={fechar}
          />
        </Modal>
      )}

      {modal.type === 'historico' && (
        <Modal open onClose={fechar} title={`Histórico — ${modal.produto.nome}`} size="lg">
          <HistoricoLimpeza movimentacoes={getPorProduto(modal.produto.id)} />
        </Modal>
      )}

      {modal.type === 'excluir' && (
        <ConfirmDialog
          open
          onClose={fechar}
          onConfirm={async () => {
            await removerProduto(modal.produto.id)
            fechar()
          }}
          title="Excluir produto"
          description={`Tem certeza que deseja excluir "${modal.produto.nome}"?`}
          confirmLabel="Excluir"
        />
      )}

      {modal.type === 'excluir-mov' && (
        <ConfirmDialog
          open
          onClose={fechar}
          onConfirm={async () => {
            await removerMovimentacao(modal.id)
            fechar()
          }}
          title="Remover saída"
          description="Esta saída será removida e o estoque será atualizado. Deseja continuar?"
          confirmLabel="Remover"
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'text-surface-400 hover:text-surface-200'
      }`}
    >
      {children}
    </button>
  )
}

function LimpezaCard({
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
            {abaixoMinimo && <AlertTriangle size={13} className="text-amber-400 shrink-0" />}
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
        <p className="text-xs text-surface-500">Mín: {produto.quantidadeMinima}</p>
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

function HistoricoLimpeza({
  movimentacoes,
}: {
  movimentacoes: ReturnType<typeof useMovimentacoesStore.getState>['movimentacoes']
}) {
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
        <div key={m.id} className="p-3 rounded-lg bg-surface-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-200">{formatDate(m.data)}</span>
            <Badge variant={m.tipo === 'entrada' ? 'success' : 'danger'}>
              {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
            </Badge>
          </div>
          {m.tipo === 'saida' && (
            <div className="flex items-center gap-2 flex-wrap">
              {m.tipoAcontecimento && (
                <Badge variant="purple">{TIPO_ACONTECIMENTO_LABEL[m.tipoAcontecimento]}</Badge>
              )}
              {m.nomeAcontecimento && (
                <span className="text-xs text-surface-400">{m.nomeAcontecimento}</span>
              )}
              {m.responsavel && (
                <span className="text-xs text-surface-500">por {m.responsavel}</span>
              )}
            </div>
          )}
          {m.observacao && <p className="text-xs text-surface-500 italic">{m.observacao}</p>}
        </div>
      ))}
    </div>
  )
}
