export function displayOpportunityTitle(title: string): string {
  return title.replace(/^\[Demonstração\]\s*/i, '').trim()
}

export function displayOpportunityDescription(description: string): string {
  return description.replace(/^\s*VAGA DE DEMONSTRAÇÃO:\s*/i, '')
}
