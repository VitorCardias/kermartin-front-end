import React, { useState } from "react";
import Titulo from "../components/Titulo";
import Pesquisar from "../components/FiltroPesquisar";
import CardFuncionario from "../components/CardFuncionario";
import CadastroFuncionario from "../components/modals/Funcionario/CadastroFuncionario";
import { useFuncionarios } from "../Hooks/useFuncionarios";

const Funcionarios: React.FC = () => {

    const [modalOpen, setModalOpen] = useState(false);
    const { funcionarios, cadastrarFuncionario } = useFuncionarios();

    return (
        <>
            <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full sm:w-4/5 mt-4 sm:mt-5 mb-4 sm:mb-5 gap-3 sm:gap-0">
                    <div className="flex flex-col gap-1">
                        <Titulo tamanho="text-xl sm:text-2xl">Gerenciamento de Funcionários</Titulo>
                        <p className="text-muted text-xs sm:text-sm">Total de {funcionarios.length} funcionários cadastrados</p>
                    </div>
                    <button 
                        className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
                        onClick={() => setModalOpen(true)}
                    >
                        Cadastrar Funcionário
                    </button>
                </div>
                <div className="w-full sm:w-4/5 bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col">
                    <Pesquisar label="Pesquisar Funcionário:" placeholder="Digite o nome do funcionário..." />
                </div>
                <CardFuncionario />
            </div>
            <CadastroFuncionario
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCadastro={cadastrarFuncionario}
            />
        </>
    );
}

export default Funcionarios;