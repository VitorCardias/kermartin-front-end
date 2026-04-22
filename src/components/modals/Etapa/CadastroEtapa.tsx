import React, { useState } from "react";
import Titulo from "../../Titulo";
import AlertModal from "../AlertModal";
import { usePerfil } from "../../../Hooks/usePerfil";
import { useEtapas } from "../../../Hooks/useEtapas";
import { authApi } from "../../../api/AuthService";
import { PrioridadeDemanda, StatusDemanda, formatarDisplayPrioridade, formatarDisplayStatusDemanda } from "../../../types/TiposDemandas";

type CadastroEtapaModalProps = {
  isOpen: boolean;
  idDemanda: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const CadastroEtapa: React.FC<CadastroEtapaModalProps> = ({ isOpen, idDemanda, onClose, onSuccess }) => {
  const perfil = usePerfil();
  const { cadastrarEtapa } = useEtapas(idDemanda);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: "Media" as const,
    status: "RequerindoEquipe" as const,
    porcentagemConclusao: 0,
    inicioPrazo: "",
    conclusaoPrazo: "",
  });

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    titulo: string;
    mensagem: string;
    tipo: "aviso" | "erro" | "sucesso";
    acaoConfirmar?: () => void;
  }>({ isOpen: false, titulo: "", mensagem: "", tipo: "aviso" });

  const [loading, setLoading] = useState(false);

  const obterDataAtualFormato = () => {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");
    return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
  };

  const herdarEquipeDemandaNaEtapa = async (idDemandaCriada: string, idEtapaCriada: string) => {
    try {
      const equipeResponse = await authApi.get(`/membro-equipe-demanda/listar-todos-por-demanda/${idDemandaCriada}`, {
        params: { page: 0, size: 200 },
      });

      const membrosEquipe = Array.isArray(equipeResponse.data)
        ? equipeResponse.data
        : Array.isArray(equipeResponse.data?.content)
          ? equipeResponse.data.content
          : [];

      if (membrosEquipe.length === 0) return;

      const promessas = membrosEquipe.map(async (membro: any) => {
        const idFuncionario = membro?.funcionarioDTO?.id;
        if (!idFuncionario) return;

        const payloads = [
          {
            etapaDemandaDTO: { id: idEtapaCriada },
            funcionarioDTO: { id: idFuncionario },
            inicioParticipacao: obterDataAtualFormato(),
          },
          {
            etapaDTO: { id: idEtapaCriada },
            funcionarioDTO: { id: idFuncionario },
            inicioParticipacao: obterDataAtualFormato(),
          },
          {
            etapaDemandaDTO: { id: idEtapaCriada },
            funcionarioDTO: { id: idFuncionario },
            inicioParticipacao: new Date().toISOString(),
          },
        ];

        for (const payload of payloads) {
          try {
            await authApi.post("/membro-equipe-etapa", payload);
            return;
          } catch {
            // tenta proximo formato
          }
        }
      });

      await Promise.all(promessas);
    } catch {
      // Nao interrompe criacao da etapa se heranca de equipe falhar.
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "porcentagemConclusao") {
      setFormData({
        ...formData,
        [name]: Math.min(100, Math.max(0, Number(value))),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = (): string | null => {
    if (!formData.titulo.trim()) {
      return "Título da etapa é obrigatório";
    }
    if (formData.titulo.trim().length < 3) {
      return "Título deve ter no mínimo 3 caracteres";
    }
    if (formData.inicioPrazo && formData.conclusaoPrazo) {
      if (new Date(formData.inicioPrazo) > new Date(formData.conclusaoPrazo)) {
        return "Data de início não pode ser maior que data de conclusão";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setAlert({
        isOpen: true,
        titulo: "Erro na Validação",
        mensagem: validationError,
        tipo: "erro",
      });
      return;
    }

    setLoading(true);
    try {
      const etapaPayload = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        prioridade: formData.prioridade,
        status: formData.status,
        porcentagemConclusao: formData.porcentagemConclusao,
        inicioPrazo: formData.inicioPrazo || null,
        conclusaoPrazo: formData.conclusaoPrazo || null,
        demandaDTO: { id: idDemanda },
        criador: { id: perfil?.id ?? "" },
      };

      console.log("Payload sendo enviado:", etapaPayload);

      const resultado = await cadastrarEtapa(etapaPayload);

      if (resultado?.id) {
        await herdarEquipeDemandaNaEtapa(idDemanda, resultado.id);
      }

      setAlert({
        isOpen: true,
        titulo: "Sucesso",
        mensagem: "Etapa cadastrada com sucesso!",
        tipo: "sucesso",
        acaoConfirmar: () => {
          setFormData({
            titulo: "",
            descricao: "",
            prioridade: "Media" as const,
            status: "RequerindoEquipe" as const,
            porcentagemConclusao: 0,
            inicioPrazo: "",
            conclusaoPrazo: "",
          });
          onSuccess?.();
          onClose();
        },
      });
    } catch (error: any) {
      console.error("Erro ao cadastrar etapa:", error);
      const mensagemErro = error?.response?.data?.message || error?.message || "Erro ao cadastrar etapa. Tente novamente.";
      setAlert({
        isOpen: true,
        titulo: "Erro ao Cadastrar",
        mensagem: mensagemErro,
        tipo: "erro",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-full bg-light border-b-3 border-default sticky top-0 z-10">
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Cadastro de Etapa</Titulo>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {/* Título */}
          <div>
            <label className="block text-primary font-medium text-sm mb-2">Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Digite o título da etapa"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-primary font-medium text-sm mb-2">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Digite a descrição da etapa"
              rows={4}
            />
          </div>

          {/* Prioridade e Status em linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium text-sm mb-2">Prioridade *</label>
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                {PrioridadeDemanda.map((prioridade) => (
                  <option key={prioridade} value={prioridade}>
                    {formatarDisplayPrioridade(prioridade)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-primary font-medium text-sm mb-2">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                {StatusDemanda.map((estado) => (
                  <option key={estado} value={estado}>
                    {formatarDisplayStatusDemanda(estado)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Datas em linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-primary font-medium text-sm mb-2">Data de Início</label>
              <input
                type="datetime-local"
                name="inicioPrazo"
                value={formData.inicioPrazo}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-primary font-medium text-sm mb-2">Data de Conclusão</label>
              <input
                type="datetime-local"
                name="conclusaoPrazo"
                value={formData.conclusaoPrazo}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 text-sm font-medium cursor-pointer disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:brightness-110 cursor-pointer disabled:opacity-50 text-sm font-medium"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        titulo={alert.titulo}
        mensagem={alert.mensagem}
        tipo={alert.tipo}
        zIndexClass="z-[80]"
        onConfirm={() => {
          setAlert((prev) => ({ ...prev, isOpen: false }));
          if (alert.acaoConfirmar) {
            alert.acaoConfirmar();
          }
        }}
        mostrarBotaoCancelar={false}
      />
    </div>
  );
};

export default CadastroEtapa;
