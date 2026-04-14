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

// Converte datetime-local (YYYY-MM-DDTHH:mm) para DD-MM-YYYY HH:mm:ss
export const converterDataTimeLocalParaISO = (dateTimeStr: string | null): string | null => {
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
  if (!dateTimeStr) return "";

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

    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao converter data:', error, dateTimeStr);
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
      displayAmigavel = "Media";
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
