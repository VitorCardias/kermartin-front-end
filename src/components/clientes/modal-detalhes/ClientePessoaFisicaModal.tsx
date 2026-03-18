import type { ClientePessoaFisica } from "../../../Hooks/useClientes";
import { formatarDisplayTipoCliente } from "../../../types/TiposClientes";

type ClientePessoaFisicaModalProps = {
  cliente: ClientePessoaFisica | null;
  onClose: () => void
}

const ClientePessoaFisicaModal: React.FC<ClientePessoaFisicaModalProps> = ({ cliente, onClose }) => {
  
  if (cliente === null) {
    return null;
  }

  return (
    
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white p-6 rounded-md border border-gray-300 shadow-2xl text-left">
        
        <h3 className="text-2xl font-semibold mb-4">Detalhes do Cliente</h3>
        
        <div className="text-lg"><strong>Nome:</strong> {cliente.nome}</div>
        <div className="text-lg"><strong>Tipo de Cliente:</strong> {formatarDisplayTipoCliente(cliente.tipoCliente)}</div>
        <div className="text-lg"><strong>CPF:</strong> {cliente.cpf || 'Não consta.'}</div>
        <div className="text-lg"><strong>Número de telefone:</strong> {cliente.numeroTelefoneContato || 'Não consta.'}</div>
        <div className="text-lg"><strong>Número de WhatsApp:</strong> {cliente.numeroWhatsAppContato || 'Não consta.'}</div>
        <div className="text-lg"><strong>Email:</strong> {cliente.emailContato || 'Não consta.'}</div>
        <div className="text-lg"><strong>Endereço:</strong> {cliente.endereco || 'Não consta.'}</div>
                
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-black text-white rounded-md transition duration-300 hover:bg-gray-800"
        >
          Fechar
        </button>
      </div>
    </div>

  )
}

export default ClientePessoaFisicaModal;