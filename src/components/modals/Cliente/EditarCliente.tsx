import React, { useState, useEffect } from "react";
import type { Cliente } from "../../../Hooks/useClientes";
import { TipoCliente } from "../../../types/TiposClientes";
import Titulo from "../../Titulo";
import AlertModal from "../AlertModal";

type EditarClienteModalProps = {
  isOpen: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onEditar: (cliente: Cliente) => Promise<void>;
};

const EditarCliente: React.FC<EditarClienteModalProps> = ({ isOpen, cliente, onClose, onEditar }) => {
  if (!isOpen || !cliente) return null;

  const [formData, setFormData] = useState<Cliente>(cliente);
  const [tipoCliente, setTipoCliente] = useState<"PF" | "PJ">(
    cliente.tipoCliente === TipoCliente.PessoaFisica ? "PF" : "PJ"
  );

  const [alert, setAlert] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "aviso" as 'aviso' | 'erro' | 'sucesso',
  });

  const [loading, setLoading] = useState(false);

  // Sincronizar formData quando o cliente muda
  useEffect(() => {
    setFormData(cliente);
    setTipoCliente(cliente.tipoCliente === TipoCliente.PessoaFisica ? "PF" : "PJ");
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value } as Cliente));
  };

  const validateForm = (): string | null => {
    if (!formData.nome.trim()) {
      return "Nome é obrigatório";
    }
    if (!formData.emailContato.trim()) {
      return "E-mail de contato é obrigatório";
    }
    if (!formData.emailContato.includes("@")) {
      return "E-mail inválido";
    }
    if (!formData.numeroTelefoneContato.trim()) {
      return "Número de telefone é obrigatório";
    }
    if (tipoCliente === "PF" && "cpf" in formData && !formData.cpf.trim()) {
      return "CPF é obrigatório";
    }
    if (tipoCliente === "PJ" && "cnpj" in formData && !formData.cnpj.trim()) {
      return "CNPJ é obrigatório";
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
      await onEditar(formData);
      
      setAlert({
        isOpen: true,
        titulo: "Sucesso",
        mensagem: "Cliente atualizado com sucesso!",
        tipo: "sucesso",
      });
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
      setAlert({
        isOpen: true,
        titulo: "Erro ao Editar",
        mensagem: error instanceof Error ? error.message : "Erro desconhecido ao editar cliente",
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
          <Titulo tamanho="text-2xl sm:text-3xl p-4 sm:p-6">Editar Cliente</Titulo>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          {/* Seletor Tipo Cliente */}
          <div>
            <label className="block text-primary font-medium text-sm">Tipo de Cliente</label>
            <select
              value={tipoCliente}
              disabled
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-100 cursor-not-allowed"
            >
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Tipo de cliente não pode ser alterado</p>
          </div>

          <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-4 sm:mb-6 mt-4">Informações Gerais</p>
          
          <div>
            <label className="block text-primary font-medium text-sm">Nome {tipoCliente === "PF" ? "(Completo)" : "(Razão Social)"}</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder={tipoCliente === "PF" ? "Digite o nome completo" : "Digite a razão social"}
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="w-full">
              <label className="block text-primary font-medium text-sm">
                {tipoCliente === "PF" ? "CPF" : "CNPJ"}
              </label>
              <input
                type="text"
                name={tipoCliente === "PF" ? "cpf" : "cnpj"}
                value={tipoCliente === "PF" && "cpf" in formData ? formData.cpf : tipoCliente === "PJ" && "cnpj" in formData ? formData.cnpj : ""}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder={tipoCliente === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                required
              />
            </div>
          </div>

          <p className="text-blue font-semibold text-xs sm:text-sm uppercase mb-4 sm:mb-6 mt-6 sm:mt-8">Contato e localização</p>

          <div>
            <label className="block text-primary font-medium text-sm">E-mail de Contato</label>
            <input
              type="email"
              name="emailContato"
              value={formData.emailContato}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="email@email.com"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="w-full">
              <label className="block text-primary font-medium text-sm">Telefone</label>
              <input
                type="text"
                name="numeroTelefoneContato"
                value={formData.numeroTelefoneContato}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="(11) 9999-9999"
                required
              />
            </div>
            <div className="w-full">
              <label className="block text-primary font-medium text-sm">WhatsApp</label>
              <input
                type="text"
                name="numeroWhatsAppContato"
                value={formData.numeroWhatsAppContato}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label className="block text-primary font-medium text-sm">Endereço</label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Rua, número, complemento"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4 mt-8 sm:mt-10">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-md transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
        <AlertModal 
          isOpen={alert.isOpen}
          titulo={alert.titulo}
          mensagem={alert.mensagem}
          tipo={alert.tipo}
          mostrarBotaoCancelar={false}
          onCancel={() => {
            setAlert({ ...alert, isOpen: false });
            if (alert.tipo === "sucesso") {
              onClose();
            }
          }}
          onConfirm={() => {
            setAlert({ ...alert, isOpen: false });
            if (alert.tipo === "sucesso") {
              onClose();
            }
          }}
        />
      </div>
    </div>
    );
}

export default EditarCliente;
