import React, { useState } from "react";
import FuncionarioList from "./funcionario/FuncionariosList";
import DemandaList from "./demanda/DemandaList";
import TarefasFuncionarioList from "./tarefa-funcionario/TarefasFuncionarioList";
import ClientesList from "./clientes/ClientesList";
import AgendaList from "./agenda/AgendaList";

type TabNavigatorProps = {
  tipoUsuario: "Escritorio" | "Funcionario";
};

const TabNavigator: React.FC<TabNavigatorProps> = ({ tipoUsuario }) => {
  // Opcional: Você pode querer que a Agenda seja a tela inicial agora!
  const [activeTab, setActiveTab] = useState(tipoUsuario === "Escritorio" ? "funcionarios" : "tarefasFuncionario");

  return (
    <div className="w-full max-w-screen-xl mx-auto p-6">
      <div className="flex gap-4 border-b border-gray-300 mb-6">
        {tipoUsuario === "Escritorio" && (
          <>
            <button onClick={() => setActiveTab("funcionarios")} className={`px-8 py-3 text-lg font-medium transition-all ${activeTab === "funcionarios" ? "border-b-2 border-black text-black" : "text-gray-600"}`}>Funcionários</button>
            <button onClick={() => setActiveTab("clientes")} className={`px-8 py-3 text-lg font-medium transition-all ${activeTab === "clientes" ? "border-b-2 border-black text-black" : "text-gray-600"}`}>Clientes</button>
            <button onClick={() => setActiveTab("demandas")} className={`px-8 py-3 text-lg font-medium transition-all ${activeTab === "demandas" ? "border-b-2 border-black text-black" : "text-gray-600"}`}>Demandas</button>
            <button onClick={() => setActiveTab("agenda")} className={`px-8 py-3 text-lg font-medium transition-all ${activeTab === "agenda" ? "border-b-2 border-black text-black" : "text-gray-600"}`}>Agenda</button>
          </>
        )}
        {tipoUsuario === "Funcionario" && (
          <>
            <button onClick={() => setActiveTab("tarefasFuncionario")} className={`px-8 py-3 text-lg font-medium transition-all ${activeTab === "tarefasFuncionario" ? "border-b-2 border-black text-black" : "text-gray-600"}`}>Minhas Tarefas</button>
            <button onClick={() => setActiveTab("clientes")} className={`px-8 py-3 text-lg font-medium transition-all ${activeTab === "clientes" ? "border-b-2 border-black text-black" : "text-gray-600"}`}>Clientes</button>
            <button onClick={() => setActiveTab("demandas")} className={`px-8 py-3 text-lg font-medium transition-all ${activeTab === "demandas" ? "border-b-2 border-black text-black" : "text-gray-600"}`}>Demandas</button>
            <button onClick={() => setActiveTab("agenda")} className={`px-8 py-3 text-lg font-medium transition-all ${activeTab === "agenda" ? "border-b-2 border-black text-black" : "text-gray-600"}`}>Agenda</button>
          </>
        )}
      </div>

      <div className="w-full bg-gray-100 rounded-md shadow-sm p-8">
        {activeTab === "funcionarios" && <FuncionarioList />}
        {activeTab === "demandas" && <DemandaList />}
        {activeTab === "tarefasFuncionario" && <TarefasFuncionarioList />}
        {activeTab === "clientes" && <ClientesList />}
        {activeTab === "agenda" && <AgendaList tipoUsuario={tipoUsuario} />} {/* Passamos o tipo de usuário para a Agenda saber o que buscar */}
      </div>
    </div>
  );
};

export default TabNavigator;