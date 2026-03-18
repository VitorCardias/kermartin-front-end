import React, { useState } from "react";
import Titulo from "../components/Titulo";
import Pesquisar from "../components/FiltroPesquisar";
import CardCliente from "../components/CardCliente";
import CadastroCliente from "../components/modals/Cliente/CadastroCliente";

const Clientes: React.FC = () => {

    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full sm:w-4/5 mt-4 sm:mt-5 mb-4 sm:mb-5 gap-3 sm:gap-0">
                    <div className="flex flex-col gap-1">
                        <Titulo tamanho="text-xl sm:text-2xl">Gerenciamento de Clientes</Titulo>
                        <p className="text-muted text-xs sm:text-sm">Total de 0 clientes cadastrados</p>
                    </div>
                    <button 
                        className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
                        onClick={() => setModalOpen(true)}
                    >
                        Cadastrar Cliente
                    </button>
                </div>
                <div className="w-full sm:w-4/5 bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col">
                    <Pesquisar label="Pesquisar Cliente:" placeholder="Digite o nome do cliente..." />
                </div>
                <CardCliente />
            </div>
            <CadastroCliente
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCadastro={async (novoCliente) => {
                    // Implement the client registration logic here
                }}
            />
        </>
    );
}

export default Clientes;