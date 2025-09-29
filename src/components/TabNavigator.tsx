import React, { useState } from "react";
import FuncionarioList from "./funcionario/FuncionariosList";
import DemandaList from "./demanda/DemandaList"; // Importando a listagem de demandas
import TarefasFuncionarioList from "./tarefa-funcionario/TarefasFuncionarioList";
import ClientesList from "./clientes/ClientesList";

type TabNavigatorProps = {
  tipoUsuario: "Escritorio" | "Funcionario";
};

const TabNavigator: React.FC<TabNavigatorProps> = ({ tipoUsuario }) => {
  const [activeTab, setActiveTab] = useState(tipoUsuario === "Escritorio" ? "funcionarios" : "tarefasFuncionario");

  return (
    <div className="w-full max-w-screen-xl mx-auto p-6">
    {/* Navegador de abas */}
    <div className="flex gap-4 border-b border-gray-300 mb-6">
      {tipoUsuario === "Escritorio" && (
        <>
          <button
            onClick={() => setActiveTab("funcionarios")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              activeTab === "funcionarios" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Funcionários
          </button>
          <button
            onClick={() => setActiveTab("clientes")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              activeTab === "clientes" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setActiveTab("demandas")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              activeTab === "demandas" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Demandas
          </button>
        </>
      )}
      {tipoUsuario === "Funcionario" && (
        <>
          <button
          onClick={() => setActiveTab("tarefasFuncionario")}
          className={`px-8 py-3 text-lg font-medium transition-all ${
            activeTab === "tarefasFuncionario" ? "border-b-2 border-black text-black" : "text-gray-600"
          }`}
        >
          Minhas Tarefas
        </button>
        <button
            onClick={() => setActiveTab("clientes")}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              activeTab === "clientes" ? "border-b-2 border-black text-black" : "text-gray-600"
            }`}
          >
            Clientes
          </button>
        <button
          onClick={() => setActiveTab("demandas")}
          className={`px-8 py-3 text-lg font-medium transition-all ${
            activeTab === "demandas" ? "border-b-2 border-black text-black" : "text-gray-600"
          }`}
        >
          Demandas
        </button>
        </>
      )}
    </div>

    {/* Conteúdo das abas - Expansão do tamanho */}
    <div className="w-full bg-gray-100 rounded-md shadow-sm p-8">
      {activeTab === "funcionarios" && <FuncionarioList />}
      {activeTab === "demandas" && <DemandaList />}
      {activeTab === "tarefasFuncionario" && <TarefasFuncionarioList />}
      {activeTab === "clientes" && <ClientesList />}
    </div>
    
  </div>

  );
};

export default TabNavigator;


