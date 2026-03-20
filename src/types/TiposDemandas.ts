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

// Função para converter do formato datetime-local ("YYYY-MM-DDTHH:mm") para formato brasileiro "DD-MM-YYYY HH:mm:ss"
export const converterDataTimeLocalParaISO = (dateTimeStr: string | null): string | null => {
  if (!dateTimeStr) return null;

  try {
    // Formato datetime-local é "YYYY-MM-DDTHH:mm"
    const [datePart, timePart] = dateTimeStr.split('T');
    if (!datePart || !timePart) {
      return null;
    }

    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    
    // Converter para formato brasileiro "DD-MM-YYYY HH:mm:ss"
    const dataBrasileira = `${day}-${month}-${year} ${hours}:${minutes}:00`;
    
    return dataBrasileira;
  } catch (error) {
    console.error('Erro ao converter data:', error, dateTimeStr);
    return null;
  }
};

// Função para converter a string para o formato "YYYY-MM-DDTHH:mm" esperado pelo input datetime-local
export const converterParaFormatoDateTimeLocal = (dateTimeStr: string | null): string => {
  if (!dateTimeStr) return "";

  try {
    let date: Date;

    // Se contém 'T', provavelmente é ISO format (2026-03-18T16:21:00)
    if (dateTimeStr.includes('T')) {
      date = new Date(dateTimeStr);
    } 
    // Se contém espaço e '-', é formato DD-MM-YYYY HH:mm:ss
    else if (dateTimeStr.includes(' ') && dateTimeStr.includes('-')) {
      const [datePart, timePart] = dateTimeStr.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');
      
      // Usar UTC para evitar problemas de fuso horário
      date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes)));
    }
    // Se contém '/', é formato DD/MM/YYYY HH:mm:ss
    else if (dateTimeStr.includes('/')) {
      const [datePart, timePart] = dateTimeStr.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];
      
      date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes)));
    }
    else {
      date = new Date(dateTimeStr);
    }

    if (isNaN(date.getTime())) {
      return "";
    }

    // Formatar para YYYY-MM-DDTHH:mm usando getUTCDate, getUTCMonth, etc
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

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
