export const obterDataFormatoCorreto = (date: string | null) => {
  if (!date) return "";
  const agora = new Date(date);
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ano = agora.getFullYear();
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  const segundos = String(agora.getSeconds()).padStart(2, "0");
  return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
};

// Função para converter a string "DD-MM-YYYY HH:mm:ss" para "YYYY-MM-DDTHH:mm"
export const converterParaFormatoDateTimeLocal = (dateTimeStr: string | null): string => {
  if (dateTimeStr) {
    // Dividir a string em data e hora
    const [datePart, timePart] = dateTimeStr.split(' ');
    // Dividir a parte da data em dia, mês e ano
    const [day, month, year] = datePart.split('-');
    // Dividir a parte da hora em horas, minutos e segundos (ignoramos segundos para datetime-local)
    const [hours, minutes] = timePart.split(':');

    // Montar a string no formato YYYY-MM-DDTHH:mm
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } else {
    return "";
  }
  
};

export const PrioridadeDemanda = ["Alta", "Media", "Baixa"] as const;
export type PrioridadeDemandaTipo = (typeof PrioridadeDemanda)[number];
export function formatarDisplayPrioridade<PrioridadeDemanda>(prioridade: PrioridadeDemanda): string {
  let displayAmigavel = "";

  switch (prioridade) {
    case 'Alta':
      displayAmigavel = "Alta";
      break;
    case 'Media':
      displayAmigavel = "Média";
      break;
    case 'Baixa':
      displayAmigavel = "Baixa";
      break;
  }

  return displayAmigavel;
}

export const StatusDemanda = ["Finalizada", "EmAndamento", "RequerindoEquipe", "Cancelada", "Atrasada"] as const;
export type StatusDemandaTipo = (typeof StatusDemanda)[number];
export function formatarDisplayStatusDemanda<StatusDemanda>(statusDemanda: StatusDemanda): string {
  let displayAmigavel = "";

  switch (statusDemanda) {
    case 'Finalizada':
      displayAmigavel = "Finalizada";
      break;
    case 'EmAndamento':
      displayAmigavel = "Em Andamento";
      break;
    case 'RequerindoEquipe':
      displayAmigavel = "Aguardando por Equipe";
      break;
    case 'Cancelada':
      displayAmigavel = "Cancelada";
      break;
    case 'Atrasada':
      displayAmigavel = "Atrasada";
      break;
  }

  return displayAmigavel;
}
