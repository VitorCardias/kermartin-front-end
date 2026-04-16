import React, { useState } from "react";
import Titulo from "../../Titulo";
import AlertModal from "../AlertModal";
import { useEtapas } from "../../../Hooks/useEtapas";
import type { EtapaDemanda } from "../../../Hooks/useEtapas";
import { PrioridadeDemanda, StatusDemanda, formatarDisplayPrioridade, formatarDisplayStatusDemanda, converterParaFormatoDateTimeLocal, obterDataFormatoCorreto } from "../../../types/TiposDemandas";

type EditarEtapaModalProps = {
  isOpen: boolean;
  etapa: EtapaDemanda | null;
  idDemanda: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const EditarEtapa: React.FC<EditarEtapaModalProps> = ({ isOpen, etapa, idDemanda, onClose, onSuccess }) => {
  const { deletarEtapaDemanda, buscarEtapas } = useEtapas(idDemanda);

  const [formData, setFormData] = useState(
    etapa ? {
      id: etapa.id,
      titulo: etapa.titulo,
      descricao: etapa.descricao || "",
      prioridade: etapa.prioridade as "Alta" | "Media" | "Baixa",
      status: etapa.status,
      porcentagemConclusao: etapa.porcentagemConclusao,
      inicioPrazo: converterParaFormatoDateTimeLocal(etapa.inicioPrazo),
      conclusaoPrazo: converterParaFormatoDateTimeLocal(etapa.conclusaoPrazo),
      criador: etapa.criador,
    } : {
      id: "",
      titulo: "",
      descricao: "",
      prioridade: "Media" as const,
      status: "RequerindoEquipe" as const,
      porcentagemConclusao: 0,
      inicioPrazo: "",
      conclusaoPrazo: "",
      criador: { id: "" },
    }
  );

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    titulo: string;
    mensagem: string;
    tipo: "aviso" | "erro" | "sucesso";
    acaoConfirmar?: () => void;
  }>({ isOpen: false, titulo: "", mensagem: "", tipo: "aviso" });

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (etapa) {
      setFormData({
        id: etapa.id,
        titulo: etapa.titulo,
        descricao: etapa.descricao || "",
        prioridade: etapa.prioridade as "Alta" | "Media" | "Baixa",
        status: etapa.status,
        porcentagemConclusao: etapa.porcentagemConclusao,
        inicioPrazo: converterParaFormatoDateTimeLocal(etapa.inicioPrazo),
        conclusaoPrazo: converterParaFormatoDateTimeLocal(etapa.conclusaoPrazo),
        criador: etapa.criador,
      });
    }
  }, [etapa, isOpen]);

  if (!isOpen || !etapa) return null;

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
        id: formData.id,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        prioridade: formData.prioridade,
        status: formData.status,
        porcentagemConclusao: formData.porcentagemConclusao,
        inicioPrazo: obterDataFormatoCorreto(formData.inicioPrazo),
        conclusaoPrazo: obterDataFormatoCorreto(formData.conclusaoPrazo),
        demandaDTO: { id: idDemanda },
        criador: formData.criador,
      };

      console.log("Payload sendo enviado:", etapaPayload);

      const { authApi } = await import("../../../api/AuthService");
      await authApi.put("/etapa-demanda", etapaPayload);

      setAlert({
        isOpen: true,
        titulo: "Sucesso",
        mensagem: "Etapa atualizada com sucesso!",
        tipo: "sucesso",
        acaoConfirmar: () => {
          buscarEtapas();
          onSuccess?.();
          onClose();
        },
      });
    } catch (error: any) {
      console.error("Erro ao atualizar etapa:", error);
      const mensagemErro = error?.response?.data?.message || error?.message || "Erro ao atualizar etapa. Tente novamente.";
      setAlert({
        isOpen: true,
        titulo: "Erro ao Atualizar",
        mensagem: mensagemErro,
        tipo: "erro",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setAlert({
      isOpen: true,
      titulo: "Confirmar Exclusão",
      mensagem: `Tem certeza que deseja deletar a etapa "${formData.titulo}"? Esta ação não pode ser desfeita.`,
      tipo: "aviso",
      acaoConfirmar: handleConfirmDelete,
    });
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const sucesso = await deletarEtapaDemanda(formData.id);
      if (sucesso) {
        setAlert({
          isOpen: true,
          titulo: "Sucesso",
          mensagem: "Etapa deletada com sucesso!",
          tipo: "sucesso",
          acaoConfirmar: () => {
            buscarEtapas();
            onSuccess?.();
            onClose();
          },
        });
      } else {
        setAlert({
          isOpen: true,
          titulo: "Erro",
          mensagem: "Erro ao deletar a etapa. Tente novamente.",
          tipo: "erro",
        });
      }
    } catch (error: any) {
      console.error("Erro ao deletar etapa:", error);
      setAlert({
        isOpen: true,
        titulo: "Erro ao Deletar",
        mensagem: error?.response?.data?.message || "Erro ao deletar etapa. Tente novamente.",
        tipo: "erro",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl border border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-full bg-light border-b-3 border-default sticky top-0 z-10 flex items-center justify-between">
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Editar Etapa</Titulo>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={loading}
            className="mr-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm font-medium disabled:opacity-50"
          >
            Deletar
          </button>
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
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        titulo={alert.titulo}
        mensagem={alert.mensagem}
        tipo={alert.tipo}
        botaoConfirmar={alert.tipo === "aviso" ? "Deletar" : "Ok"}
        onConfirm={() => {
          setAlert((prev) => ({ ...prev, isOpen: false }));
          if (alert.acaoConfirmar) {
            alert.acaoConfirmar();
          }
        }}
        mostrarBotaoCancelar={alert.tipo === "aviso"}
        onCancel={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default EditarEtapa;