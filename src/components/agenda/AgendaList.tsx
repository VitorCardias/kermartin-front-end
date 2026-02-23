import React, { useState } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  isWithinInterval, parse 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAgenda } from "../../hooks/useAgenda";
import TarefasDoDiaModal from "./TarefasDoDiaModal";
import AdicionarTarefaAgendaModal from "./AdicionarTarefaAgendaModal";
import EditarTarefaDemandaModal from "../tarefa-demanda/EditarTarefaDemandaModal";
import type { TarefaDemandaAPI } from "../../hooks/useTarefasDemandas";
// Ajuste o caminho do seu modal de edição!

type AgendaProps = {
  tipoUsuario: "Escritorio" | "Funcionario";
};

const AgendaList: React.FC<AgendaProps> = ({ tipoUsuario }) => {
  const [dataAtual, setDataAtual] = useState(new Date());
  
  const anoAtual = dataAtual.getFullYear();
  const mesAtual = dataAtual.getMonth() + 1;

  const { tarefas, loading, buscarTarefasAgenda, deletarTarefa } = useAgenda(tipoUsuario, anoAtual, mesAtual);

  const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaDemandaAPI | null>(null); 
  const [diaExpandido, setDiaExpandido] = useState<Date | null>(null); 
  const [modalCriacaoAberto, setModalCriacaoAberto] = useState(false);
  const [dataPreSelecionadaParaCriacao, setDataPreSelecionadaParaCriacao] = useState<Date | null>(null);

  const abrirModalCriacao = (dataSugerida: Date | null = null) => {
    setDataPreSelecionadaParaCriacao(dataSugerida);
    setModalCriacaoAberto(true);
  };

  const proximoMes = () => setDataAtual(addMonths(dataAtual, 1));
  const mesAnterior = () => setDataAtual(subMonths(dataAtual, 1));

  const parseDataBrasil = (dataStr: string | null) => {
    if (!dataStr) return null;
    try {
      return parse(dataStr, "dd-MM-yyyy HH:mm:ss", new Date());
    } catch {
      return new Date(dataStr); 
    }
  };

  const tarefasDoDiaExpandido = diaExpandido ? tarefas.filter(tarefa => {
    const inicio = parseDataBrasil(tarefa.inicioPrazo);
    if (!inicio) return false;
    const fim = parseDataBrasil(tarefa.conclusaoPrazo) || inicio;
    return isWithinInterval(diaExpandido, { start: startOfDay(inicio), end: endOfDay(fim) });
  }) : [];

  const renderizarCelulas = () => {
    const inicioDoMes = startOfMonth(dataAtual);
    const fimDoMes = endOfMonth(inicioDoMes);
    const dataInicial = startOfWeek(inicioDoMes);
    const dataFinal = endOfWeek(fimDoMes);

    const formatoDia = "d";
    const linhas = [];
    let dias = [];
    let diaCorrente = dataInicial;

    while (diaCorrente <= dataFinal) {
      for (let i = 0; i < 7; i++) {
        const diaFormatado = format(diaCorrente, formatoDia);
        const cloneDia = diaCorrente;

        const tarefasDoDia = tarefas.filter(tarefa => {
          const inicio = parseDataBrasil(tarefa.inicioPrazo);
          if (!inicio) return false; 
          const fim = parseDataBrasil(tarefa.conclusaoPrazo) || inicio;
          return isWithinInterval(cloneDia, { start: startOfDay(inicio), end: endOfDay(fim) });
        });

        dias.push(
          <div
            key={diaCorrente.toString()}
            onClick={() => setDiaExpandido(cloneDia)} 
            className={`min-h-[140px] p-2 border-b border-r border-gray-200 transition-colors relative cursor-pointer group ${
              !isSameMonth(diaCorrente, inicioDoMes)
                ? "bg-gray-50 text-gray-400"
                : isSameDay(diaCorrente, new Date())
                ? "bg-blue-50 text-blue-900 font-semibold"
                : "bg-white text-gray-800 hover:bg-gray-50" 
            }`}
          >
            <span className="block text-right text-sm mb-1 group-hover:text-blue-600 transition-colors">
              {diaFormatado}
            </span>
            
            <div className="flex flex-col gap-1 mt-1">
              {tarefasDoDia.slice(0, 3).map(t => (
                <div 
                  key={t.id} 
                  title={t.titulo}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setTarefaSelecionada(t); 
                  }}
                  className={`text-xs px-2 py-1 rounded truncate shadow-sm border transition-colors ${
                    t.prioridade === "Alta" ? "bg-red-50 text-red-800 border-red-200 hover:bg-red-100" 
                    : t.prioridade === "Media" ? "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
                    : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                  }`} 
                >
                  {t.titulo}
                </div>
              ))}
              
              {tarefasDoDia.length > 3 && (
                <div className="text-xs text-gray-500 font-medium hover:text-black hover:bg-gray-200 px-1 py-0.5 rounded text-center mt-1 transition-colors">
                  + {tarefasDoDia.length - 3} mais
                </div>
              )}
            </div>
          </div>
        );
        diaCorrente = addDays(diaCorrente, 1);
      }
      linhas.push(
        <div className="grid grid-cols-7" key={diaCorrente.toString()}>
          {dias}
        </div>
      );
      dias = [];
    }
    return <div className="border-l border-t border-gray-200 rounded-lg overflow-hidden">{linhas}</div>;
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      
      {/* CABEÇALHO ATUALIZADO */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-3xl font-bold capitalize text-gray-900">
          {format(dataAtual, "MMMM yyyy", { locale: ptBR })}
        </h3>
        
        <div className="flex items-center gap-6">
          
          {/* Navegação e Status */}
          <div className="flex space-x-3 items-center">
            {/* Div com largura fixa para o 'Atualizando' não empurrar os botões */}
            <div className="w-24 text-right">
              {loading && <span className="text-sm text-gray-500 animate-pulse">Atualizando...</span>}
            </div>
            <button onClick={mesAnterior} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition">Anterior</button>
            <button onClick={() => setDataAtual(new Date())} className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-md text-gray-700 transition font-medium">Hoje</button>
            <button onClick={proximoMes} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition">Próximo</button>
          </div>

          {/* Divisória visual */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Botão Nova Tarefa Fixo na Direita */}
          <button 
            onClick={() => abrirModalCriacao(new Date())} 
            className="px-5 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition shadow-md"
          >
            + Nova Tarefa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>

      {renderizarCelulas()}

      {/* Modais */}
      {diaExpandido && (
        <TarefasDoDiaModal
          data={diaExpandido}
          tarefas={tarefasDoDiaExpandido}
          onClose={() => setDiaExpandido(null)}
          onTarefaClick={(t) => setTarefaSelecionada(t)}
          onAdicionarNova={() => abrirModalCriacao(diaExpandido)} 
        />
      )}

      {modalCriacaoAberto && (
        <AdicionarTarefaAgendaModal
          dataPadrao={dataPreSelecionadaParaCriacao}
          tipoUsuario={tipoUsuario}
          onClose={() => setModalCriacaoAberto(false)}
          onTarefaAdicionada={() => {
             buscarTarefasAgenda();
             setModalCriacaoAberto(false);
          }}
        />
      )}

      {tarefaSelecionada && (
        <EditarTarefaDemandaModal
          tarefa={tarefaSelecionada}
          onClose={() => setTarefaSelecionada(null)} 
          onAtualizado={() => {
            buscarTarefasAgenda(); 
            setTarefaSelecionada(null); 
          }}
          funcDeletar={deletarTarefa}
        />
      )}

    </div>
  );
};

const startOfDay = (date: Date) => { const d = new Date(date); d.setHours(0,0,0,0); return d; };
const endOfDay = (date: Date) => { const d = new Date(date); d.setHours(23,59,59,999); return d; };

export default AgendaList;