import React, { useState } from "react";
import Titulo from "../components/Titulo";
import Pesquisar from "../components/filtros/FiltroPesquisar";
import CardCliente from "../components/CardCliente";
import CadastroCliente from "../components/modals/Cliente/CadastroCliente";
import EditarCliente from "../components/modals/Cliente/EditarCliente";
import { useClientes } from "../Hooks/useClientes";
import type { Cliente } from "../Hooks/useClientes";

const Clientes: React.FC = () => {
    const { criarCliente, clientes, editarCliente } = useClientes();
    const [modalOpen, setModalOpen] = useState(false);
    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
    const [termoPesquisa, setTermoPesquisa] = useState("");

    // Filtrar clientes baseado no termo de pesquisa
    const clientesFiltrados = clientes.filter((cliente) =>
        cliente.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        cliente.emailContato.toLowerCase().includes(termoPesquisa.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full sm:w-4/5 mt-4 sm:mt-5 mb-4 sm:mb-5 gap-3 sm:gap-0">
                    <div className="flex flex-col gap-1">
                        <Titulo tamanho="text-xl sm:text-2xl">Gerenciamento de Clientes</Titulo>
                        <p className="text-muted text-xs sm:text-sm">Total de {clientes.length} clientes cadastrados</p>
                    </div>
                    <button 
                        className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
                        onClick={() => setModalOpen(true)}
                    >
                        Cadastrar Cliente
                    </button>
                </div>
                <div className="w-full sm:w-4/5 bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col">
                    <Pesquisar 
                        label="Pesquisar Cliente:" 
                        placeholder="Digite o nome do cliente..." 
                        onSearch={setTermoPesquisa}
                    />
                </div>
                <div className="w-full flex flex-col gap-3 sm:gap-4 items-center justify-center">
                    {clientesFiltrados.length === 0 ? (
                        <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
                            <p className="text-muted text-sm sm:text-base">
                                {termoPesquisa ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
                            </p>
                        </div>
                    ) : (
                        clientesFiltrados.map((cliente) => (
                            <div className="flex w-full items-center justify-center" key={cliente.id} onClick={() => setClienteEditando(cliente)}>
                                <CardCliente 
                                    nome={cliente.nome}
                                    email={cliente.emailContato}
                                    tipo={cliente.tipoCliente}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
            {modalOpen && (
                <CadastroCliente
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onCadastro={async (novoCliente) => {
                        await criarCliente(novoCliente);
                    }}
                />
            )}
            {clienteEditando && (
                <EditarCliente
                    isOpen={!!clienteEditando}
                    cliente={clienteEditando}
                    onClose={() => setClienteEditando(null)}
                    onEditar={async (clienteAtualizado) => {
                        await editarCliente(clienteAtualizado);
                        setClienteEditando(null);
                    }}
                />
            )}
        </>
    );
}

export default Clientes;