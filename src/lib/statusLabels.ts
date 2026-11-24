const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativa',
  DRAFT: 'Rascunho',
  PAUSED: 'Pausada',
  CLOSED: 'Encerrada',
  SENT: 'Enviada',
  SUBMITTED: 'Enviada',
  VIEWED: 'Visualizada',
  UNDER_REVIEW: 'Em análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
}

export function getStatusLabel(status: string) {
  return statusLabels[status] ?? status
}
