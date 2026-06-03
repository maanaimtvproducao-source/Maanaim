// ─── Equipes ─────────────────────────────────────────────────────────────────

export type EquipeKey =
  | 'APOIO'
  | 'BOMBEIROS'
  | 'CANTINA'
  | 'COZINHA'
  | 'ENFERMARIA'
  | 'GRUPO_DE_LOUVOR'
  | 'PASTOR'
  | 'TELECOMUNICACOES'
  | 'SECRETARIA'
  | 'SEGURANCA'
  | 'SOM'
  | 'TRANSITO'
  | 'LIVRARIA'
  | 'SEMINARIO'

export const EQUIPES: Record<EquipeKey, string> = {
  APOIO: 'Apoio',
  BOMBEIROS: 'Bombeiros',
  CANTINA: 'Cantina',
  COZINHA: 'Cozinha',
  ENFERMARIA: 'Enfermaria',
  GRUPO_DE_LOUVOR: 'Grupo de Louvor',
  PASTOR: 'Pastor',
  TELECOMUNICACOES: 'Telecomunicações',
  SECRETARIA: 'Secretaria',
  SEGURANCA: 'Segurança',
  SOM: 'Som',
  TRANSITO: 'Trânsito',
  LIVRARIA: 'Livraria',
  SEMINARIO: 'Seminário',
}

export const EQUIPES_ORDENADAS: EquipeKey[] = [
  'APOIO',
  'BOMBEIROS',
  'CANTINA',
  'COZINHA',
  'ENFERMARIA',
  'GRUPO_DE_LOUVOR',
  'PASTOR',
  'TELECOMUNICACOES',
  'SECRETARIA',
  'SEGURANCA',
  'SOM',
  'TRANSITO',
  'LIVRARIA',
  'SEMINARIO',
]

// ─── Usuário ──────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'membro'

export interface Usuario {
  uid: string
  nome: string
  email: string
  equipe: EquipeKey | 'ADMIN'
  role: UserRole
  aprovado: boolean
  createdAt: string
}

// ─── Participações ────────────────────────────────────────────────────────────

export interface Participacao {
  quantidade: number
  lancadoPor: string
  atualizadoEm: string
}

export interface DadosBombeiros {
  publicoSeminarista: number
  criancasIntermediarios: number
  atualizadoEm: string
}

// ─── Setores ──────────────────────────────────────────────────────────────────

export type Setor = 'almoxarifado' | 'limpeza'

// ─── Tipos de acontecimento ───────────────────────────────────────────────────

export type TipoAcontecimento =
  | 'culto'
  | 'evento'
  | 'batismo'
  | 'mutirao'
  | 'ensaio'
  | 'reuniao'
  | 'outro'

export const TIPO_ACONTECIMENTO_LABEL: Record<TipoAcontecimento, string> = {
  culto: 'Culto',
  evento: 'Evento',
  batismo: 'Batismo',
  mutirao: 'Mutirão',
  ensaio: 'Ensaio',
  reuniao: 'Reunião',
  outro: 'Outro',
}

// ─── Unidades de medida ───────────────────────────────────────────────────────

export type UnidadeMedida =
  | 'unidade'
  | 'pacote'
  | 'litro'
  | 'kg'
  | 'caixa'
  | 'rolo'
  | 'par'
  | 'metro'

export const UNIDADE_LABEL: Record<UnidadeMedida, string> = {
  unidade: 'Unidade(s)',
  pacote: 'Pacote(s)',
  litro: 'Litro(s)',
  kg: 'Kg',
  caixa: 'Caixa(s)',
  rolo: 'Rolo(s)',
  par: 'Par(es)',
  metro: 'Metro(s)',
}

// ─── Produto ──────────────────────────────────────────────────────────────────

export interface Produto {
  id: string
  nome: string
  descricao?: string
  unidade: UnidadeMedida
  setor: Setor
  quantidadeAtual: number
  quantidadeMinima: number
  createdAt: string
  updatedAt: string
}

// ─── Movimentação ─────────────────────────────────────────────────────────────

export type TipoMovimentacao = 'entrada' | 'saida'

export interface Movimentacao {
  id: string
  produtoId: string
  tipo: TipoMovimentacao
  quantidade: number
  setor: Setor
  data: string
  observacao?: string
  acontecimentoId?: string
  tipoAcontecimento?: TipoAcontecimento
  nomeAcontecimento?: string
  responsavel?: string
  createdAt: string
}

// ─── Acontecimento ────────────────────────────────────────────────────────────

export interface Acontecimento {
  id: string
  nome: string
  tipo: TipoAcontecimento
  data: string
  descricao?: string
  createdAt: string
}

// ─── Relatório ────────────────────────────────────────────────────────────────

export interface FiltroRelatorio {
  mes: number
  ano: number
  setor?: Setor
  tipoAcontecimento?: TipoAcontecimento
}
