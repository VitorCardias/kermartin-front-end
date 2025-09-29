import { useState } from "react";
import { useClientes, type Cliente } from "../../hooks/useClientes";
import ClientePessoaFisicaModal from "./modal-detalhes/ClientePessoaFisicaModal";
import { TipoCliente } from "../../types/TiposClientes";
import ClientePessoaJuridicaModal from "./modal-detalhes/ClientePessoaJuridicaModal";
import EditarClientePessoaFisicaModal from "./modal-edicao/EditarClientePessoaFisicaModal";
import EditarClientePessoaJuridicaModal from "./modal-edicao/EditarClientePessoaJuridicaModal";
import CadastroClienteModal from "./modal-cadastro/CadastroClienteModal";

const ClientesList: React.FC = () => {
  const { clientes, loading, paginaAtual, setPaginaAtual, totalPaginas, editarCliente, criarCliente } = useClientes();
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [modalCadastroAberto, setModalCadastroAberto] = useState<boolean>(false);
  

  const renderDetalhesModal = () => {
    if (clienteSelecionado === null) {
      return null;
    }

    switch (clienteSelecionado.tipoCliente) {
      case TipoCliente.PessoaFisica: {
        const clientePF = clienteSelecionado;
        return <ClientePessoaFisicaModal cliente={clientePF} onClose={() => setClienteSelecionado(null)} />;
      }
      case TipoCliente.PessoaJuridica: {
        const clientePJ = clienteSelecionado;
        return <ClientePessoaJuridicaModal cliente={clientePJ} onClose={() => setClienteSelecionado(null)} />;
      }
      default: {
        return null;
      }
    }

  }
  
  const renderEdicaoModal = () => {
    if (clienteEditando === null) {
      return null;
    }

    switch (clienteEditando.tipoCliente) {
      case TipoCliente.PessoaFisica: {
        const clientePF = clienteEditando;
        return <EditarClientePessoaFisicaModal cliente={clientePF} onClose={() => setClienteEditando(null)} onUpdate={editarCliente} />;
      }
      case TipoCliente.PessoaJuridica: {
        const clientePJ = clienteEditando;
        return <EditarClientePessoaJuridicaModal cliente={clientePJ} onClose={() => setClienteEditando(null)} onUpdate={editarCliente} />;
      }
      default:
        return null;
    }
  }

  const renderCadastroModal = () => {
    if (modalCadastroAberto === false) {
      return null
    } else {
      return <CadastroClienteModal onClose={() => setModalCadastroAberto(false)} onCadastro={criarCliente} />
    }
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto bg-white text-gray-900 p-8 rounded-md shadow-sm">
      
      <div className="flex justify-between items-center"> 
        <h3 className="text-2xl font-semibold mb-6">Gerenciamento de Clientes</h3>
        <button
          onClick={() => setModalCadastroAberto(true)}
          className="mb-4 px-6 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
        > Cadastrar Cliente </button>
      </div>

      {loading ? (
        <p className="text-lg text-gray-600">Carregando clientes...</p>
        ) : (
          <>
            <ul className="space-y-4">
              {clientes.map((cliente) => (
                <li
                  key={cliente.id}
                  className="flex justify-between items-center p-6 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  <span
                    onClick={() => setClienteSelecionado(cliente)}
                    className="text-lg hover:underline"
                  >
                    <strong>{cliente.nome}</strong>
                  </span>
                  <button
                    onClick={() => setClienteEditando(cliente)}
                    className="px-4 py-2 bg-black text-white rounded-md transition hover:bg-gray-800"
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>

          {/* Paginação aprimorada */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={() => setPaginaAtual(paginaAtual - 1)}
              disabled={paginaAtual === 0}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-lg font-medium">Página {paginaAtual + 1} de {totalPaginas}</span>
            <button
              onClick={() => setPaginaAtual(paginaAtual + 1)}
              disabled={paginaAtual + 1 >= totalPaginas}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
          
        </>
      )}

      {/* Modal de detalhes */}
      {renderDetalhesModal()}

      {/* Modal de edição */}
      {renderEdicaoModal()}

      {/* Modal de cadastro */}
      {renderCadastroModal()}

    </div>
  )

}

export default ClientesList;