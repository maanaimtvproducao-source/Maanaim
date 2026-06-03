import { useState, useMemo } from 'react'
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useProdutosStore } from '@/stores/produtosStore'
import { useMovimentacoesStore } from '@/stores/movimentacoesStore'
import { useAcontecimentosStore } from '@/stores/acontecimentosStore'
import { formatDate, formatMonthYear, getMesAtual, getAnoAtual } from '@/lib/utils'
import {
  TIPO_ACONTECIMENTO_LABEL,
  UNIDADE_LABEL,
  type Setor,
  type TipoAcontecimento,
} from '@/types'

type Tab = 'mensal' | 'acontecimentos'

export function RelatoriosPage() {
  const [tab, setTab] = useState<Tab>('mensal')
  const [mes, setMes] = useState(getMesAtual())
  const [ano, setAno] = useState(getAnoAtual())
  const [setorFiltro, setSetorFiltro] = useState<Setor | 'todos'>('todos')

  const todosProdutos = useProdutosStore((s) => s.produtos)
  const todasMovimentacoesStore = useMovimentacoesStore((s) => s.movimentacoes)
  const todosAcontecimentos = useAcontecimentosStore((s) => s.acontecimentos)

  const movMes = useMemo(() => {
    return todasMovimentacoesStore.filter((m) => {
      const d = new Date(m.data)
      const mesOk = d.getMonth() + 1 === mes && d.getFullYear() === ano
      if (!mesOk) return false
      if (setorFiltro !== 'todos') return m.setor === setorFiltro
      return true
    })
  }, [todasMovimentacoesStore, mes, ano, setorFiltro])

  const entradas = useMemo(() => movMes.filter((m) => m.tipo === 'entrada'), [movMes])
  const saidas = useMemo(() => movMes.filter((m) => m.tipo === 'saida'), [movMes])

  // Agrupado por produto para o gráfico
  const dadosPorProduto = useMemo(() => {
    const map = new Map<string, { nome: string; entradas: number; saidas: number }>()
    movMes.forEach((m) => {
      const produto = todosProdutos.find((p) => p.id === m.produtoId)
      const nome = produto?.nome ?? 'Removido'
      const atual = map.get(m.produtoId) ?? { nome, entradas: 0, saidas: 0 }
      if (m.tipo === 'entrada') atual.entradas += m.quantidade
      else atual.saidas += m.quantidade
      map.set(m.produtoId, atual)
    })
    return Array.from(map.values()).sort((a, b) => (b.entradas + b.saidas) - (a.entradas + a.saidas))
  }, [movMes, todosProdutos])

  // Agrupado por acontecimento para a aba de acontecimentos
  const saidasLimpeza = useMemo(
    () => todasMovimentacoesStore.filter((m) => m.setor === 'limpeza' && m.tipo === 'saida'),
    [todasMovimentacoesStore]
  )

  const saidasMesLimpeza = useMemo(
    () =>
      saidasLimpeza.filter((m) => {
        const d = new Date(m.data)
        return d.getMonth() + 1 === mes && d.getFullYear() === ano
      }),
    [saidasLimpeza, mes, ano]
  )

  const grupoPorAcontecimento = useMemo(() => {
    type GrupoItem = {
      chave: string
      acontecimentoId?: string
      tipo: TipoAcontecimento
      nome: string
      data: string
      itens: Array<{ produtoId: string; nome: string; quantidade: number; unidade: string }>
    }
    const map = new Map<string, GrupoItem>()

    saidasMesLimpeza.forEach((m) => {
      // Prioriza o acontecimento vinculado via ID; cai no agrupamento por nome/tipo se não houver
      const acVinculado = m.acontecimentoId
        ? todosAcontecimentos.find((a) => a.id === m.acontecimentoId)
        : undefined

      const chave = m.acontecimentoId
        ? m.acontecimentoId
        : `avulso-${m.nomeAcontecimento ?? m.tipoAcontecimento ?? 'sem-nome'}-${m.data}`

      const atual = map.get(chave) ?? {
        chave,
        acontecimentoId: m.acontecimentoId,
        tipo: (acVinculado?.tipo ?? m.tipoAcontecimento ?? 'outro') as TipoAcontecimento,
        nome:
          acVinculado?.nome ??
          m.nomeAcontecimento ??
          TIPO_ACONTECIMENTO_LABEL[(m.tipoAcontecimento ?? 'outro') as TipoAcontecimento],
        data: acVinculado?.data ?? m.data,
        itens: [],
      }

      const produto = todosProdutos.find((p) => p.id === m.produtoId)
      const itemExistente = atual.itens.find((i) => i.produtoId === m.produtoId)
      if (itemExistente) {
        itemExistente.quantidade += m.quantidade
      } else {
        atual.itens.push({
          produtoId: m.produtoId,
          nome: produto?.nome ?? 'Produto removido',
          quantidade: m.quantidade,
          unidade: produto ? UNIDADE_LABEL[produto.unidade] : '',
        })
      }
      map.set(chave, atual)
    })

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )
  }, [saidasMesLimpeza, todosProdutos, todosAcontecimentos])

  const navMes = (dir: -1 | 1) => {
    let novoMes = mes + dir
    let novoAno = ano
    if (novoMes < 1) { novoMes = 12; novoAno-- }
    if (novoMes > 12) { novoMes = 1; novoAno++ }
    setMes(novoMes)
    setAno(novoAno)
  }

  return (
    <div className="space-y-5">
      {/* Controle de mês */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-lg p-1">
          <Button variant="ghost" size="icon-sm" onClick={() => navMes(-1)}>
            <ChevronLeft size={15} />
          </Button>
          <span className="text-sm font-medium text-surface-200 px-2 min-w-36 text-center">
            {formatMonthYear(mes, ano)}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={() => navMes(1)}>
            <ChevronRight size={15} />
          </Button>
        </div>

        <div className="flex rounded-lg bg-surface-800 border border-surface-700 p-1 gap-1">
          {(['todos', 'almoxarifado', 'limpeza'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSetorFiltro(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                setorFiltro === s ? 'bg-primary-600 text-white' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {s === 'todos' ? 'Todos' : s === 'almoxarifado' ? 'Almoxarifado' : 'Limpeza'}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg bg-surface-800 border border-surface-700 p-1 gap-1 ml-auto">
          <button
            onClick={() => setTab('mensal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === 'mensal' ? 'bg-primary-600 text-white' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <BarChart3 size={13} /> Mensal
          </button>
          <button
            onClick={() => setTab('acontecimentos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === 'acontecimentos' ? 'bg-primary-600 text-white' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Calendar size={13} /> Acontecimentos
          </button>
        </div>
      </div>

      {/* ABA MENSAL */}
      {tab === 'mensal' && (
        <div className="space-y-5">
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ResumoCard
              icon={TrendingUp}
              label="Total de entradas"
              value={entradas.reduce((a, m) => a + m.quantidade, 0)}
              color="success"
            />
            <ResumoCard
              icon={TrendingDown}
              label="Total de saídas"
              value={saidas.reduce((a, m) => a + m.quantidade, 0)}
              color="danger"
            />
            <ResumoCard
              icon={Package}
              label="Moviment. Almoxarifado"
              value={movMes.filter((m) => m.setor === 'almoxarifado').length}
              color="primary"
            />
            <ResumoCard
              icon={Sparkles}
              label="Moviment. Limpeza"
              value={movMes.filter((m) => m.setor === 'limpeza').length}
              color="cyan"
            />
          </div>

          {/* Gráfico */}
          {dadosPorProduto.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Movimentações por produto</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={dadosPorProduto.slice(0, 10)}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="nome"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + '…' : v}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        color: '#e2e8f0',
                        fontSize: 12,
                      }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Lista detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento das movimentações</CardTitle>
              <Badge variant="default">{movMes.length} registros</Badge>
            </CardHeader>
            <CardContent>
              {movMes.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="Nenhuma movimentação"
                  description={`Sem registros em ${formatMonthYear(mes, ano)} para o filtro selecionado.`}
                />
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {movMes.map((m) => {
                    const produto = todosProdutos.find((p) => p.id === m.produtoId)
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-700 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm text-surface-200 truncate">
                              {produto?.nome ?? 'Produto removido'}
                            </p>
                            <Badge variant={m.setor === 'almoxarifado' ? 'primary' : 'cyan'} className="text-xs">
                              {m.setor === 'almoxarifado' ? 'Almox.' : 'Limpeza'}
                            </Badge>
                            {m.tipoAcontecimento && (
                              <Badge variant="purple" className="text-xs">
                                {TIPO_ACONTECIMENTO_LABEL[m.tipoAcontecimento]}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-surface-500 mt-0.5">
                            {formatDate(m.data)}
                            {m.nomeAcontecimento ? ` — ${m.nomeAcontecimento}` : ''}
                          </p>
                        </div>
                        <Badge variant={m.tipo === 'entrada' ? 'success' : 'danger'}>
                          {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ABA ACONTECIMENTOS */}
      {tab === 'acontecimentos' && (
        <div className="space-y-4">
          {grupoPorAcontecimento.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum acontecimento com saídas"
              description={`Não há saídas de limpeza vinculadas a acontecimentos em ${formatMonthYear(mes, ano)}.`}
            />
          ) : (
            grupoPorAcontecimento.map((grupo) => (
              <Card key={grupo.chave} variant="bordered">
                <CardHeader>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle>{grupo.nome}</CardTitle>
                      <Badge variant="purple">{TIPO_ACONTECIMENTO_LABEL[grupo.tipo]}</Badge>
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{formatDate(grupo.data)}</p>
                  </div>
                  <Badge variant="default">{grupo.itens.reduce((a, i) => a + i.quantidade, 0)} itens usados</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {grupo.itens.map((item) => (
                      <div
                        key={item.produtoId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-surface-300">{item.nome}</span>
                        <span className="text-surface-400">
                          {item.quantidade} {item.unidade}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ResumoCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: 'success' | 'danger' | 'primary' | 'cyan'
}) {
  const colorMap = {
    success: 'bg-emerald-900 text-emerald-300',
    danger: 'bg-red-900 text-red-300',
    primary: 'bg-primary-900 text-primary-300',
    cyan: 'bg-cyan-900 text-cyan-300',
  }
  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <div className={`rounded-md p-1.5 ${colorMap[color]}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-2xl font-bold text-surface-50">{value}</p>
      <p className="text-xs text-surface-500 leading-tight mt-0.5">{label}</p>
    </Card>
  )
}
