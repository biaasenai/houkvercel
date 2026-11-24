export const PROFESSIONAL_CATEGORIES = [
  'Administração',
  'Tecnologia',
  'Atendimento',
  'Comércio',
  'Construção',
  'Saúde',
  'Educação',
  'Marketing',
  'Design',
  'Logística',
  'Serviços Gerais',
  'Engenharia',
] as const

export type ProfessionalCategory =
  (typeof PROFESSIONAL_CATEGORIES)[number]

const categoryKeywords: Record<ProfessionalCategory, string[]> = {
  Administração: [
    'administracao',
    'administrador',
    'administrativo',
    'recursos humanos',
    'financeiro',
    'contabil',
  ],
  Tecnologia: [
    'tecnologia',
    'desenvolvedor',
    'desenvolvedora',
    'programador',
    'programadora',
    'software',
    'analista de sistemas',
    'infraestrutura de ti',
  ],
  Atendimento: [
    'atendimento',
    'telemarketing',
    'suporte ao cliente',
    'sac',
    'recepcionista',
  ],
  Comércio: [
    'comercio',
    'vendas',
    'vendedor',
    'vendedora',
    'comercial',
    'operador de caixa',
    'loja',
  ],
  Construção: [
    'construcao',
    'pedreiro',
    'carpinteiro',
    'encanador',
    'obra',
    'eletricista',
  ],
  Saúde: [
    'saude',
    'enfermeiro',
    'enfermagem',
    'medico',
    'dentista',
    'fisioterapeuta',
    'clinica',
  ],
  Educação: [
    'educacao',
    'professor',
    'professora',
    'docente',
    'pedagogo',
    'ensino',
    'instrutor',
  ],
  Marketing: [
    'marketing',
    'publicidade',
    'social media',
    'seo',
    'midia',
  ],
  Design: [
    'design',
    'designer',
    'ux designer',
    'ui designer',
    'grafico',
  ],
  Logística: [
    'logistica',
    'motorista',
    'entregador',
    'estoque',
    'expedicao',
    'almoxarife',
  ],
  'Serviços Gerais': [
    'servicos gerais',
    'limpeza',
    'zelador',
    'auxiliar de limpeza',
    'copeira',
  ],
  Engenharia: [
    'engenharia',
    'engenheiro',
    'engenheira',
    'projetista',
    'analista de engenharia',
  ],
}

export function inferProfessionalCategory(
  title: string,
): ProfessionalCategory | null {
  const normalizedTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  return PROFESSIONAL_CATEGORIES.find(category =>
    categoryKeywords[category].some(keyword =>
      normalizedTitle.includes(keyword),
    ),
  ) ?? null
}
