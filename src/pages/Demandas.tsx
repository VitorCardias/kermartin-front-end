import React, { useState } from "react";
import Titulo from "../components/Titulo";
import Pesquisar from "../components/FiltroPesquisar";
import CardDemanda from "../components/CardDemanda";
import CadastroDemanda from "../components/modals/Demanda/CadastroDemanda";
import EditarDemanda from "../components/modals/Demanda/EditarDemanda";
import { useDemandas } from "../Hooks/useDemandas";

const Demandas: React.FC = () => {
    const { demandas, loading, buscarDemandas } = useDemandas();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [demandaSelecionada, setDemandaSelecionada] = useState<any>(null);
    const [termoPesquisa, setTermoPesquisa] = useState("");

    // Filtrar demandas baseado no termo de pesquisa
    const demandasFiltradas = demandas.filter((demanda) =>
        demanda.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        demanda.clienteDto?.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        demanda.descricao?.toLowerCase().includes(termoPesquisa.toLowerCase())
    );

    const mapearStatusParaDisplay = (status: string): 'aguardando' | 'andamento' | 'finalizado' | 'atrasada' => {
        switch (status) {
            case 'RequerindoEquipe':
                return 'aguardando';
            case 'EmAndamento':
                return 'andamento';
            case 'Finalizada':
                return 'finalizado';
            case 'Atrasada':
                return 'atrasada';
            default:
                return 'aguardando';
        }
    };

    const mapearPrioridadeParaDisplay = (prioridade: string): 'baixa' | 'media' | 'alta' => {
        switch (prioridade) {
            case 'Alta':
                return 'alta';
            case 'Media':
                return 'media';
            case 'Baixa':
                return 'baixa';
            default:
                return 'baixa';
        }
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full sm:w-4/5 mt-4 sm:mt-5 mb-4 sm:mb-5 gap-3 sm:gap-0">
                    <div className="flex flex-col gap-1">
                        <Titulo tamanho="text-xl sm:text-2xl">Gerenciamento de Demandas</Titulo>
                        <p className="text-muted text-xs sm:text-sm">Total de {demandas.length} demandas cadastradas</p>
                    </div>
                    <button 
                        className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Cadastrar Demanda
                    </button>
                </div>
                <div className="w-full sm:w-4/5 bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col">
                    <Pesquisar 
                        label="Pesquisar Demanda:" 
                        placeholder="Digite o título, cliente ou descrição..." 
                        onSearch={setTermoPesquisa}
                    />
                </div>
                <div className="w-full flex flex-col gap-3 sm:gap-4 items-center justify-center">
                    {loading ? (
                        <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
                            <p className="text-muted text-sm sm:text-base">Carregando demandas...</p>
                        </div>
                    ) : demandasFiltradas.length === 0 ? (
                        <div className="w-full sm:w-4/5 text-center py-8 bg-white rounded-lg shadow-md">
                            <p className="text-muted text-sm sm:text-base">
                                {termoPesquisa ? "Nenhuma demanda encontrada" : "Nenhuma demanda cadastrada ainda"}
                            </p>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-4 items-center justify-center">
                            {demandasFiltradas.map((demanda) => (
                                <CardDemanda
                                    key={demanda.id}
                                    titulo={demanda.titulo}
                                    cliente={demanda.clienteDto?.nome || "Sem cliente"}
                                    prioridade={mapearPrioridadeParaDisplay(demanda.prioridadeDemanda)}
                                    status={mapearStatusParaDisplay(demanda.statusDemanda)}
                                    dataVencimento={demanda.conclusaoPrazo || "Sem data"}
                                    demanda={demanda}
                                    onEdit={(demandaEditando) => {
                                        setDemandaSelecionada(demandaEditando);
                                        setIsEditModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CadastroDemanda 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    buscarDemandas();
                    setIsModalOpen(false);
                }}
            />

            <EditarDemanda 
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setDemandaSelecionada(null);
                }}
                demanda={demandaSelecionada}
                onSuccess={() => {
                    buscarDemandas();
                    setIsEditModalOpen(false);
                    setDemandaSelecionada(null);
                }}
            />
        </>
    );
}

export default Demandas;