import React, { useState } from "react";
import { format } from "date-fns";
import { formatarDisplayPrioridade, formatarDisplayStatusDemanda, PrioridadeDemanda, StatusDemanda } from "../../types/TiposDemandas";
import { authApi } from "../../api/AuthService";
import { usePerfil } from "../../Hooks/usePerfil";

type AdicionarTarefaAgendaModalProps = {
  dataPadrao: Date | null;
  tipoUsuario: "Escritorio" | "Funcionario";
  onClose: () => void;
  onTarefaAdicionada: () => void;
};

const AdicionarTarefaAgendaModal: React.FC<AdicionarTarefaAgendaModalProps> = ({ dataPadrao, tipoUsuario, onClose, onTarefaAdicionada }) => {
  const perfil = usePerfil();

  const formatarParaInputDate = (data: Date | null) => {
    if (!data) return "";
    return format(data, "yyyy-MM-dd'T'09:00"); 
  };

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: PrioridadeDemanda[1],
    status: StatusDemanda[2],
    inicioPrazo: formatarParaInputDate(dataPadrao),
    conclusaoPrazo: formatarParaInputDate(dataPadrao),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatarDataParaAPI = (dataLocal: string): string | null => {
    if (!dataLocal) return null;
    const data = new Date(dataLocal);
    return format(data, "dd-MM-yyyy HH:mm:ss");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. CRIA A TAREFA (Totalmente independente)
      const responseTarefa = await authApi.post("/tarefa-etapa", {
        titulo: formData.titulo,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
        status: formData.status,
        inicioPrazo: formatarDataParaAPI(formData.inicioPrazo),
        conclusaoPrazo: formatarDataParaAPI(formData.conclusaoPrazo),
        demandaDTO: null, // Sem vínculo com demanda
        etapaDemandaDTO: null, // Sem vínculo com etapa
        criador: { id: perfil?.id },
        porcentagemConclusao: 0
      });

      const idNovaTarefa = responseTarefa.data?.id;

      // 2. AUTO-ATRIBUIÇÃO (Apenas Funcionario)
      if (tipoUsuario === "Funcionario" && idNovaTarefa && perfil?.id) {
        await authApi.post("/membro-equipe-tarefa", {
          tarefaDTO: { id: idNovaTarefa },
          funcionarioDTO: { id: perfil.id },
          status: StatusDemanda[1] 
        });
      }

      onTarefaAdicionada();
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar tarefa independente:", error);
      alert("Ocorreu um erro ao criar a tarefa.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        
        <h3 className="text-2xl font-bold mb-2 text-gray-900">Nova Tarefa Independente</h3>
        <p className="text-sm text-gray-500 mb-6">Criando uma tarefa avulsa diretamente na sua agenda.</p>
        
        <button type="button" onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {tipoUsuario === "Funcionario" && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Como funcionário, você será <strong>automaticamente adicionado à equipe</strong> desta tarefa para que ela apareça na sua agenda.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título:*</label>
            <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição:</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Início do Prazo:*</label>
              <input type="datetime-local" name="inicioPrazo" value={formData.inicioPrazo} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Conclusão do Prazo:*</label>
              <input type="datetime-local" name="conclusaoPrazo" value={formData.conclusaoPrazo} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prioridade:</label>
              <select name="prioridade" value={formData.prioridade} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition">
                {PrioridadeDemanda.map((p) => <option key={p} value={p}>{formatarDisplayPrioridade(p)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status:</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition">
                {StatusDemanda.map((s) => <option key={s} value={s}>{formatarDisplayStatusDemanda(s)}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition">Cancelar</button>
            <button type="submit" className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 font-medium shadow-md transition">Criar Tarefa</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdicionarTarefaAgendaModal;