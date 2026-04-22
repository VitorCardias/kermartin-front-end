import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Titulo from './Titulo';
import Status from './Status';
import Prioridade from './Prioridade';
import ModalAlerta from './modals/AlertModal';

interface CardDemandaProps {
  titulo?: string;
  cliente?: string;
  status?: 'aguardando' | 'andamento' | 'finalizado' | 'atrasada';
  prioridade?: 'baixa' | 'media' | 'alta';
  dataVencimento?: string;
  responsaveis?: string[];
  onDelete?: () => void;
  demanda?: any;
  onEdit?: (demanda: any) => void;
  onStatusChanged?: (demandaAtualizada: any) => void;
}

const CardDemanda: React.FC<CardDemandaProps> = ({
  titulo = 'Solicitar Extrato Analitico',
  cliente = 'Banco XYZ',
  prioridade = 'baixa',
  status,
  dataVencimento = '',
  responsaveis = [],
  onDelete,
  demanda,
  onEdit,
}) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const parseData = (valor?: string): Date | null => {
    if (!valor) return null;

    if (valor.includes('T')) {
      const iso = new Date(valor);
      return Number.isNaN(iso.getTime()) ? null : iso;
    }

    const normalizada = valor.trim();
    const [dataParte, horaParte] = normalizada.split(' ');
    if (!dataParte) return null;

    if (dataParte.includes('-')) {
      const partes = dataParte.split('-');
      if (partes.length === 3) {
        if (partes[0].length === 4) {
          const [ano, mes, dia] = partes;
          const [hora = '00', minuto = '00', segundo = '00'] = (horaParte || '').split(':');
          const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
          return Number.isNaN(dt.getTime()) ? null : dt;
        }

        const [dia, mes, ano] = partes;
        const [hora = '00', minuto = '00', segundo = '00'] = (horaParte || '').split(':');
        const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
        return Number.isNaN(dt.getTime()) ? null : dt;
      }
    }

    if (dataParte.includes('/')) {
      const [dia, mes, ano] = dataParte.split('/');
      const [hora = '00', minuto = '00', segundo = '00'] = (horaParte || '').split(':');
      const dt = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
      return Number.isNaN(dt.getTime()) ? null : dt;
    }

    const fallback = new Date(normalizada);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  };

  const normalizarStatus = (statusBruto?: string): 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' => {
    switch (statusBruto) {
      case 'RequerindoEquipe':
      case 'aguardando':
        return 'aguardando';
      case 'EmAndamento':
      case 'andamento':
        return 'andamento';
      case 'Finalizada':
      case 'finalizado':
        return 'finalizado';
      case 'Atrasada':
      case 'atrasada':
        return 'atrasada';
      default:
        return 'aguardando';
    }
  };

  const vencimentoInfo = useMemo(() => {
    const dataVencimentoDate = parseData(dataVencimento);
    if (!dataVencimentoDate) return { texto: 'Sem data', cor: '#6B7280' };

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataVencimentoDate.setHours(0, 0, 0, 0);

    const diffTime = dataVencimentoDate.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return { texto: 'Vencido', cor: '#EF4444' };
    if (diffDias === 0) return { texto: 'Hoje', cor: '#F59E0B' };
    if (diffDias === 1) return { texto: 'Amanha', cor: '#F59E0B' };
    if (diffDias <= 3) return { texto: `${diffDias} dias`, cor: '#F59E0B' };

    return { texto: `${diffDias} dias`, cor: '#64748b' };
  }, [dataVencimento]);

  const formatarDataExibicao = (data: string | null | undefined): string => {
    if (!data) return 'Sem data';

    try {
      const dataObj = parseData(data);
      if (!dataObj) return 'Data invalida';

      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();

      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error('Erro ao formatar data:', data, error);
      return 'Data invalida';
    }
  };

  const handleConfirmarDelete = () => {
    setModalOpen(false);
    onDelete?.();
  };

  const handleAbrirDemanda = () => {
    if (!demanda?.id) return;

    navigate(`/demanda/${demanda.id}`, {
      state: {
        demanda,
      },
    });
  };

  const statusBase = demanda?.statusDemanda || status;
  let statusParaComponente = normalizarStatus(statusBase);

  const dataVencimentoDate = parseData(dataVencimento);
  if (statusParaComponente !== 'finalizado' && dataVencimentoDate) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencimento = new Date(dataVencimentoDate);
    vencimento.setHours(0, 0, 0, 0);

    if (vencimento.getTime() < hoje.getTime()) {
      statusParaComponente = 'atrasada';
    }
  }

  let corBordaCard = 'border-l-aguardando';
  if (statusParaComponente === 'andamento') corBordaCard = 'border-l-andamento';
  if (statusParaComponente === 'finalizado') corBordaCard = 'border-l-finalizado';
  if (statusParaComponente === 'atrasada') corBordaCard = 'border-l-atrasada';

  const equipeExibicao =
    responsaveis.length > 0
      ? responsaveis
      : demanda?.responsavelList?.map((r: any) => r?.nome || r?.funcionarioDTO?.nomeCompleto).filter(Boolean) || [];

  return (
    <>
      <div
        className={`w-full sm:w-5/6 lg:w-4/5 bg-white rounded-lg shadow-md flex flex-col ${corBordaCard} border-l-6 cursor-pointer overflow-hidden transition-all duration-300`}
        onClick={handleAbrirDemanda}
      >
        <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-row gap-2 mb-2 items-center flex-wrap">
                <Status status={statusParaComponente} />
                <Prioridade prioridade={prioridade} />
              </div>
              <Titulo tamanho="text-sm sm:text-base md:text-lg">
                {titulo} - {cliente}
              </Titulo>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 md:gap-5 text-muted text-xs sm:text-xs md:text-sm">
                <p style={statusParaComponente === 'finalizado' ? {} : { color: vencimentoInfo.cor }} className="text-status-completed">
                  Vence em: {formatarDataExibicao(dataVencimento)} ({statusParaComponente === 'finalizado' ? 'Finalizada' : vencimentoInfo.texto})
                </p>
                <p className="truncate">Responsavel: {equipeExibicao.length > 0 ? equipeExibicao.join(', ') : 'Sem Atribuições'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-1 sm:gap-2">
              <button
                className="text-xs sm:text-xs md:text-sm bg-primary text-white px-2 sm:px-3 py-1.5 sm:py-1 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap order-2 sm:order-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(demanda);
                }}
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalAlerta
        isOpen={modalOpen}
        titulo="Excluir Demanda"
        mensagem={`Tem certeza que deseja excluir a demanda "${titulo}"? Esta acao nao pode ser desfeita.`}
        botaoCancelar="Cancelar"
        botaoConfirmar="Excluir"
        tipo="erro"
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirmarDelete}
      />
    </>
  );
};

export default CardDemanda;
