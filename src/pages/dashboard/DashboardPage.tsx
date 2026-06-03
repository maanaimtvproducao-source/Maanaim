import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useProdutosStore } from '@/stores/produtosStore'
import { useMovimentacoesStore } from '@/stores/movimentacoesStore'
import { useAcontecimentosStore } from '@/stores/acontecimentosStore'
import { formatDate, formatMonthYear, getMesAtual, getAnoAtual } from '@/lib/utils'
import { TIPO_ACONTECIMENTO_LABEL, UNIDADE_LABEL, type Produto } from '@/types'

export function DashboardPage() {
  const produtos = useProdutosStore((s) => s.produtos)
  const movimentacoes = useMovimentacoesStore((s) => s.movimentacoes)
  const acontecimentos = useAcontecimentosStore((s) => s.acontecimentos)

  const mes = getMesAtual()
  const ano = getAnoAtual()

  const stats = useMemo(() => {
    const movMes = movimentacoes.filter((m) => {
      const d = new Date(m.data)
      return d.getMonth() + 1 === mes && d.getFullYear() === ano
    })
    const totalEntradas = movMes.filter((m) => m.tipo === 'entrada').reduce((a, m) => a + m.quantidade, 0)
    const totalSaidas = movMes.filter((m) => m.tipo === 'saida').reduce((a, m) => a + m.quantidade, 0)

    const totalAlmox = produtos.filter((p) => p.setor === 'almoxarifado').length
    const totalLimpeza = produtos.filter((p) => p.setor === 'limpeza').length
    const abaixoMinimo = produtos.filter((p) => p.quantidadeAtual <= p.quantidadeMinima)

    return { totalEntradas, totalSaidas, totalAlmox, totalLimpeza, abaixoMinimo }
  }, [produtos, movimentacoes, mes, ano])

  const acontecimentosMes = useMemo(() => {
    return acontecimentos.filter((a) => {
      const d = new Date(a.data)
      return d.getMonth() + 1 === mes && d.getFullYear() === ano
    }).slice(0, 5)
  }, [acontecimentos, mes, ano])

  const ultimasMovimentacoes = useMemo(() => {
    return movimentacoes
      .filter((m) => {
        const d = new Date(m.data)
        return d.getMonth() + 1 === mes && d.getFullYear() === ano
      })
      .slice(0, 6)
  }, [movimentacoes, mes, ano])

  return (
    <div className="space-y-6">
      {/* Cabeçalho do mês */}
      <div className="flex items-center gap-2 text-surface-400 text-sm">
        <Calendar size={14} />
        <span>Resumo de {formatMonthYear(mes, ano)}</span>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Itens no Almoxarifado"
          value={stats.totalAlmox}
          color="primary"
        />
        <StatCard
          icon={Sparkles}
          label="Itens de Limpeza"
          value={stats.totalLimpeza}
          color="cyan"
        />
        <StatCard
          icon={TrendingUp}
          label="Entradas no mês"
          value={stats.totalEntradas}
          color="success"
        />
        <StatCard
          icon={TrendingDown}
          label="Saídas no mês"
          value={stats.totalSaidas}
          color="warning"
        />
      </div>

      {/* Alerta de estoque baixo */}
      {stats.abaixoMinimo.length > 0 && (
        <Card variant="bordered" className="border-amber-800/50 bg-amber-950/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <CardTitle className="text-amber-300">Itens com estoque baixo</CardTitle>
            </div>
            <Badge variant="warning">{stats.abaixoMinimo.length} itens</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.abaixoMinimo.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-surface-300">{p.nome}</span>
                    <Badge variant={p.setor === 'almoxarifado' ? 'primary' : 'cyan'} className="text-xs">
                      {p.setor === 'almoxarifado' ? 'Almoxarifado' : 'Limpeza'}
                    </Badge>
                  </div>
                  <span className="text-amber-400 font-medium">
                    {p.quantidadeAtual} {UNIDADE_LABEL[p.unidade]}
                  </span>
                </div>
              ))}
              {stats.abaixoMinimo.length > 4 && (
                <p className="text-xs text-surface-500 mt-1">
                  +{stats.abaixoMinimo.length - 4} outros itens...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Acontecimentos do mês */}
        <Card>
          <CardHeader>
            <CardTitle>Acontecimentos do mês</CardTitle>
            <Link to="/relatorios">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver tudo <ArrowRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {acontecimentosMes.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-4">
                Nenhum acontecimento registrado este mês.
              </p>
            ) : (
              <div className="space-y-2">
                {acontecimentosMes.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-surface-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-surface-200">{a.nome}</p>
                      <p className="text-xs text-surface-500">{formatDate(a.data)}</p>
                    </div>
                    <Badge variant="purple">{TIPO_ACONTECIMENTO_LABEL[a.tipo]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movimentações recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {ultimasMovimentacoes.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-4">
                Nenhuma movimentação este mês.
              </p>
            ) : (
              <div className="space-y-2">
                {ultimasMovimentacoes.map((m) => {
                  const produto = produtos.find((p: Produto) => p.id === m.produtoId)
                  return (
                    <div key={m.id} className="flex items-center justify-between py-2 border-b border-surface-700 last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-200 truncate">
                          {produto?.nome ?? 'Produto removido'}
                        </p>
                        <p className="text-xs text-surface-500">{formatDate(m.data)}</p>
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

      {/* Atalhos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/almoxarifado">
          <div className="group flex items-center gap-3 p-4 rounded-xl bg-surface-800 border border-surface-700 hover:border-primary-600 hover:bg-surface-750 transition-all cursor-pointer">
            <div className="rounded-lg bg-primary-900 p-2 group-hover:bg-primary-600 transition-colors">
              <Package size={18} className="text-primary-300 group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-surface-200">Almoxarifado</p>
              <p className="text-xs text-surface-500">{stats.totalAlmox} produtos</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-surface-600 group-hover:text-primary-400" />
          </div>
        </Link>
        <Link to="/limpeza">
          <div className="group flex items-center gap-3 p-4 rounded-xl bg-surface-800 border border-surface-700 hover:border-cyan-600 hover:bg-surface-750 transition-all cursor-pointer">
            <div className="rounded-lg bg-cyan-900 p-2 group-hover:bg-cyan-600 transition-colors">
              <Sparkles size={18} className="text-cyan-300 group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-surface-200">Limpeza</p>
              <p className="text-xs text-surface-500">{stats.totalLimpeza} produtos</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-surface-600 group-hover:text-cyan-400" />
          </div>
        </Link>
        <Link to="/relatorios">
          <div className="group flex items-center gap-3 p-4 rounded-xl bg-surface-800 border border-surface-700 hover:border-purple-600 hover:bg-surface-750 transition-all cursor-pointer">
            <div className="rounded-lg bg-purple-900 p-2 group-hover:bg-purple-600 transition-colors">
              <Calendar size={18} className="text-purple-300 group-hover:text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-surface-200">Relatórios</p>
              <p className="text-xs text-surface-500">Mensal e por evento</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-surface-600 group-hover:text-purple-400" />
          </div>
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: 'primary' | 'cyan' | 'success' | 'warning'
}) {
  const colorMap = {
    primary: 'bg-primary-900 text-primary-300',
    cyan: 'bg-cyan-900 text-cyan-300',
    success: 'bg-emerald-900 text-emerald-300',
    warning: 'bg-amber-900 text-amber-300',
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-surface-50">{value}</p>
          <p className="text-xs text-surface-500 leading-tight mt-0.5">{label}</p>
        </div>
      </div>
    </Card>
  )
}
