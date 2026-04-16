export const PrioridadeTarefa = ["Baixa", "Media", "Alta"] as const;
export type PrioridadeTarefaTipo = (typeof PrioridadeTarefa)[number];

export const StatusTarefaTipo = ["Finalizada", "EmAndamento", "RequerindoEquipe", "Cancelada", "Atrasada"] as const;
export type StatusTarefaTipo = (typeof StatusTarefaTipo)[number];

export function formatarDisplayPrioridade(prioridade: PrioridadeTarefaTipo): string {
  switch (prioridade) {
    case 'Baixa':
      return 'Baixa';
    case 'Media':
      return 'Média';
    case 'Alta':
      return 'Alta';
    default:
      return prioridade;
  }
}

export function formatarDisplayStatus(status: StatusTarefaTipo): string {
  switch (status) {
    case 'Finalizada':
      return 'Finalizada';
    case 'EmAndamento':
      return 'Em Andamento';
    case 'RequerindoEquipe':
      return 'Requerindo Equipe';
    case 'Cancelada':
      return 'Cancelada';
    case 'Atrasada':
      return 'Atrasada';
    default:
      return status;
  }
}

export function obterCorStatus(status: StatusTarefaTipo): { bg: string; text: string } {
  switch (status) {
    case 'Finalizada':
      return { bg: 'status-completed-bg', text: 'status-completed-text' };
    case 'EmAndamento':
      return { bg: 'status-inprogress-bg', text: 'status-inprogress-text' };
    case 'RequerindoEquipe':
      return { bg: 'status-wait-bg', text: 'status-wait-text' };
    case 'Atrasada':
      return { bg: 'status-delayed-bg', text: 'status-delayed-text' };
    default:
      return { bg: 'status-wait-bg', text: 'status-wait-text' };
  }
}

// Converte datetime-local (YYYY-MM-DDTHH:mm) para DD-MM-YYYY HH:mm:ss
export const converterDataTimeLocalParaAPI = (dateTimeStr: string | null): string | null => {
  if (!dateTimeStr) return null;

  try {
    const [datePart, timePart] = dateTimeStr.split('T');
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');

    return `${day}-${month}-${year} ${hours}:${minutes}:00`;
  } catch (error) {
    console.error('Erro ao converter data:', error, dateTimeStr);
    return null;
  }
};

// Converte formatos diversos para YYYY-MM-DDTHH:mm (input datetime-local)
export const converterParaFormatoDateTimeLocal = (dateTimeStr: string | null): string => {
  if (!dateTimeStr) return '';

  try {
    let date: Date;

    if (dateTimeStr.includes('T')) {
      date = new Date(dateTimeStr);
    } else if (dateTimeStr.includes(' ') && dateTimeStr.includes('-')) {
      const [datePart, timePart] = dateTimeStr.split(' ');
      const partesData = datePart.split('-');
      const [hours = '00', minutes = '00'] = (timePart || '').split(':');

      let day = '01';
      let month = '01';
      let year = '1970';

      if (partesData[0]?.length === 4) {
        // YYYY-MM-DD
        [year, month, day] = partesData;
      } else {
        // DD-MM-YYYY
        [day, month, year] = partesData;
      }

      date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
    } else if (dateTimeStr.includes('/')) {
      const [datePart, timePart] = dateTimeStr.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours = '00', minutes = '00'] = (timePart || '').split(':');

      date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
    } else {
      date = new Date(dateTimeStr);
    }

    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao converter data:', error, dateTimeStr);
    return '';
  }
};