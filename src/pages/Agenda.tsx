import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { authApi } from "../api/AuthService";
import { useAgenda } from "../Hooks/useAgenda";
import { useClientesParaFiltro } from "../Hooks/useClientesParaFiltro";
import { useFuncionariosParaFiltro } from "../Hooks/useFuncionariosParaFiltro";
import { usePerfil } from "../Hooks/usePerfil";
import CadastroTarefa from "../components/modals/Tarefa/CadastroTarefa";

type DemandaFiltro = {
    id: string;
    titulo: string;
    clienteDto?: {
        id: string;
        nome?: string;
    } | null;
};

const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

const normalizarTexto = (valor?: string | null) =>
    (valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const parseData = (valor?: string | null): Date | null => {
    if (!valor) return null;

    const texto = valor.trim();
    if (!texto) return null;

    if (texto.includes("T")) {
        const dataIso = new Date(texto);
        return isNaN(dataIso.getTime()) ? null : dataIso;
    }

    if (texto.includes(" ")) {
        const [dataParte, horaParte] = texto.split(" ");
        if (dataParte?.includes("-")) {
            const partes = dataParte.split("-");
            if (partes.length === 3) {
                let dia = "01";
                let mes = "01";
                let ano = "1970";

                if (partes[0].length === 4) {
                    [ano, mes, dia] = partes;
                } else {
                    [dia, mes, ano] = partes;
                }

                const [hora = "00", minuto = "00", segundo = "00"] = (horaParte || "").split(":");
                const data = new Date(
                    Number(ano),
                    Number(mes) - 1,
                    Number(dia),
                    Number(hora),
                    Number(minuto),
                    Number(segundo)
                );
                return isNaN(data.getTime()) ? null : data;
            }
        }
    }

    const fallback = new Date(texto);
    return isNaN(fallback.getTime()) ? null : fallback;
};

const toDateKey = (date: Date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

const prioridadeNormalizada = (valor?: string | null) => {
    const prioridade = normalizarTexto(valor);
    if (prioridade.includes("alta")) return "alta";
    if (prioridade.includes("media") || prioridade.includes("medio")) return "media";
    return "baixa";
};

const corPrioridade = (prioridade?: string | null) => {
    const chave = prioridadeNormalizada(prioridade);

    if (chave === "alta") {
        return {
            dot: "bg-red-500",
            badge: "bg-red-100 text-red-700 border-red-300",
            card: "border-l-red-500",
            label: "Alta",
        };
    }

    if (chave === "media") {
        return {
            dot: "bg-amber-400",
            badge: "bg-amber-100 text-amber-800 border-amber-300",
            card: "border-l-amber-400",
            label: "Média",
        };
    }

    return {
        dot: "bg-blue-500",
        badge: "bg-blue-100 text-blue-700 border-blue-300",
        card: "border-l-blue-500",
        label: "Baixa",
    };
};

const Agenda: React.FC = () => {
    const perfil = usePerfil();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [busca, setBusca] = useState("");
    const [demandaSelecionada, setDemandaSelecionada] = useState("");
    const [clienteSelecionado, setClienteSelecionado] = useState("");
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState("");
    const [prioridadesSelecionadas, setPrioridadesSelecionadas] = useState<string[]>([
        "alta",
        "media",
        "baixa",
    ]);

    const [demandas, setDemandas] = useState<DemandaFiltro[]>([]);
    const [tarefaExpandida, setTarefaExpandida] = useState<string | null>(null);
    const [cadastroTarefaAberto, setCadastroTarefaAberto] = useState(false);


    const ano = currentDate.getFullYear();
    const mes = currentDate.getMonth() + 1;
    const tipoUsuario = perfil?.tipoUsuario || "Escritorio";

    const { tarefas, loading } = useAgenda(tipoUsuario, ano, mes);
    const { clientesParaFiltro } = useClientesParaFiltro();
    const { funcionariosParaFiltro } = useFuncionariosParaFiltro();

    useEffect(() => {
        const buscarDemandas = async () => {
            try {
                const response = await authApi.get("/demanda");
                if (Array.isArray(response.data)) {
                    setDemandas(response.data as DemandaFiltro[]);
                    return;
                }

                if (response.data?.content && Array.isArray(response.data.content)) {
                    setDemandas(response.data.content as DemandaFiltro[]);
                    return;
                }

                setDemandas([]);
            } catch (error) {
                console.error("Erro ao buscar demandas para filtro da agenda:", error);
                setDemandas([]);
            }
        };

        buscarDemandas();
    }, []);

    useEffect(() => {
        const mudouMes =
            selectedDate.getMonth() !== currentDate.getMonth() ||
            selectedDate.getFullYear() !== currentDate.getFullYear();

        if (mudouMes) {
            setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
        }
    }, [currentDate, selectedDate]);

    const demandasMap = useMemo(() => new Map(demandas.map((d) => [d.id, d])), [demandas]);

    const tarefasComDados = useMemo(() => {
        return tarefas
            .map((tarefa) => {
                const demandaId = tarefa.demandaDTO?.id;
                const demandaInfo = demandaId ? demandasMap.get(demandaId) : undefined;
                const dataReferencia = parseData(tarefa.conclusaoPrazo) ?? parseData(tarefa.inicioPrazo);

                return {
                    ...tarefa,
                    demandaId,
                    demandaTitulo: demandaInfo?.titulo || tarefa.demandaDTO?.titulo || "",
                    clienteId: demandaInfo?.clienteDto?.id || "",
                    funcionarioId: tarefa.criador?.id || "",
                    funcionarioNome:
                        funcionariosParaFiltro.find((funcionario) => funcionario.id === tarefa.criador?.id)?.nomeCompleto ||
                        "",
                    dataReferencia,
                };
            })
            .filter((tarefa) => {
                if (!tarefa.dataReferencia) return false;

                return (
                    tarefa.dataReferencia.getMonth() === currentDate.getMonth() &&
                    tarefa.dataReferencia.getFullYear() === currentDate.getFullYear()
                );
            });
    }, [tarefas, demandasMap, funcionariosParaFiltro, currentDate]);

    const tarefasFiltradas = useMemo(() => {
        const buscaNormalizada = normalizarTexto(busca);

        return tarefasComDados.filter((tarefa) => {
            if (buscaNormalizada) {
                const campos = [
                    tarefa.titulo,
                    tarefa.descricao,
                    tarefa.demandaTitulo,
                    tarefa.funcionarioNome,
                    clientesParaFiltro.find((cliente) => cliente.id === tarefa.clienteId)?.nome,
                ];

                const passouBusca = campos.some((campo) => normalizarTexto(campo).includes(buscaNormalizada));
                if (!passouBusca) return false;
            }

            if (demandaSelecionada && tarefa.demandaId !== demandaSelecionada) return false;
            if (clienteSelecionado && tarefa.clienteId !== clienteSelecionado) return false;
            if (funcionarioSelecionado && tarefa.funcionarioId !== funcionarioSelecionado) return false;

            const prioridade = prioridadeNormalizada(tarefa.prioridade);
            if (!prioridadesSelecionadas.includes(prioridade)) return false;

            return true;
        });
    }, [
        tarefasComDados,
        busca,
        demandaSelecionada,
        clienteSelecionado,
        funcionarioSelecionado,
        prioridadesSelecionadas,
        clientesParaFiltro,
    ]);

    const tarefasPorDia = useMemo(() => {
        const mapa = new Map<string, typeof tarefasFiltradas>();

        tarefasFiltradas.forEach((tarefa) => {
            if (!tarefa.dataReferencia) return;
            const chave = toDateKey(tarefa.dataReferencia);
            const listaAtual = mapa.get(chave) || [];
            mapa.set(chave, [...listaAtual, tarefa]);
        });

        return mapa;
    }, [tarefasFiltradas]);

    const tarefasDiaSelecionado = useMemo(() => {
        const chave = toDateKey(selectedDate);
        return tarefasPorDia.get(chave) || [];
    }, [tarefasPorDia, selectedDate]);

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const generateCalendarDays = () => {
        const days: Array<number | null> = [];
        const totalDays = daysInMonth(currentDate);
        const firstDay = firstDayOfMonth(currentDate);

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }

        return days;
    };

    const calendarDays = generateCalendarDays();
    const hoje = new Date();

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        const now = new Date();
        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    };
    const handleCadastroTarefaSuccess = () => {
        // Recarregar as tarefas da agenda
        setCadastroTarefaAberto(false);
    };

    const togglePrioridade = (prioridade: string) => {
        setPrioridadesSelecionadas((prev) =>
            prev.includes(prioridade) ? prev.filter((item) => item !== prioridade) : [...prev, prioridade]
        );
    };

    const limparFiltros = () => {
        setBusca("");
        setDemandaSelecionada("");
        setClienteSelecionado("");
        setFuncionarioSelecionado("");
        setPrioridadesSelecionadas(["alta", "media", "baixa"]);
    };

    const dataSelecionadaLabel = selectedDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className="flex flex-col gap-5 p-4 lg:p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-5">
                <div className="grid grid-cols-1 gap-3 items-end">
                    <div className="xl:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Buscar tarefa</label>
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Título, descrição ou cliente"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Demanda</label>
                            <select
                                value={demandaSelecionada}
                                onChange={(e) => setDemandaSelecionada(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todas</option>
                                {demandas.map((demanda) => (
                                    <option key={demanda.id} value={demanda.id}>
                                        {demanda.titulo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Cliente</label>
                            <select
                                value={clienteSelecionado}
                                onChange={(e) => setClienteSelecionado(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                {clientesParaFiltro.map((cliente) => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Funcionário</label>
                            <select
                                value={funcionarioSelecionado}
                                onChange={(e) => setFuncionarioSelecionado(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todos</option>
                                {funcionariosParaFiltro.map((funcionario) => (
                                    <option key={funcionario.id} value={funcionario.id}>
                                        {funcionario.nomeCompleto}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Prioridade</label>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                                {[
                                    { key: "alta", label: "Alta", bg: "bg-red-500" },
                                    { key: "media", label: "Média", bg: "bg-amber-400" },
                                    { key: "baixa", label: "Baixa", bg: "bg-blue-500" },
                                ].map((prioridade) => (
                                
                                <label
                                    key={prioridade.key}
                                    className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-md px-2.5 py-1.5"
                                >
                                    <input
                                        type="checkbox"
                                        checked={prioridadesSelecionadas.includes(prioridade.key)}
                                        onChange={() => togglePrioridade(prioridade.key)}
                                        className="w-4 h-4"
                                    />
                                    <span className={`w-2.5 h-2.5 rounded-full ${prioridade.bg}`} />
                                    {prioridade.label}
                                </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={limparFiltros}
                        className="h-10 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                        Limpar filtros
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousMonth}
                            className="p-2 hover:bg-gray-100 rounded-md transition"
                            title="Mês anterior"
                        >
                            <ChevronLeft size={20} className="text-gray-700" />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-md transition"
                            title="Próximo mês"
                        >
                            <ChevronRight size={20} className="text-gray-700" />
                        </button>
                    </div>
                    <button
                        className="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-2 rounded hover:brightness-110 transition hover:-translate-y-1 cursor-pointer whitespace-nowrap w-full sm:w-auto"
                        onClick={() => setCadastroTarefaAberto(true)}
                    >
                        Cadastrar Tarefa
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Desktop - Vista com tarefas */}
                        <div className="hidden lg:block">
                            <div className="grid grid-cols-7 gap-px mb-px bg-gray-200 rounded-t-lg overflow-hidden">
                                {dayNames.map((day) => (
                                    <div
                                        key={day}
                                        className="bg-blue-50 p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm text-gray-700"
                                    >
                                        {day}
                                    </div>
                                ))} 
                            </div>

                            <div className="grid grid-cols-7 gap-px bg-gray-50 rounded-b-lg overflow-hidden">
                                {calendarDays.map((day, index) => {
                                    if (!day) {
                                        return <div key={index} className="min-h-28 bg-gray-50" />;
                                    }

                                    const dataCelula = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                    const chaveDia = toDateKey(dataCelula);
                                    const tarefasDoDia = tarefasPorDia.get(chaveDia) || [];

                                    const isToday =
                                        dataCelula.getDate() === hoje.getDate() &&
                                        dataCelula.getMonth() === hoje.getMonth() &&
                                        dataCelula.getFullYear() === hoje.getFullYear();

                                    const isSelected =
                                        dataCelula.getDate() === selectedDate.getDate() &&
                                        dataCelula.getMonth() === selectedDate.getMonth() &&
                                        dataCelula.getFullYear() === selectedDate.getFullYear();

                                    return (
                                        <button
                                            type="button"
                                            key={index}
                                            onClick={() => setSelectedDate(dataCelula)}
                                            className={`min-h-28 p-3 bg-white text-left transition hover:bg-slate-50 ${
                                                isSelected ? "ring-2 ring-inset ring-blue-500" : ""
                                            }`}
                                        >
                                            <div className={`font-semibold text-base mb-1.5
                                                ${isToday ? "text-white bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center" : "text-gray-800"}`}
                                            >{day}</div>

                                            <div className="space-y-1">
                                                {tarefasDoDia.slice(0, 3).map((tarefa) => {
                                                    const cor = corPrioridade(tarefa.prioridade);
                                                    return (
                                                        <div
                                                            key={tarefa.id}
                                                            className={`text-xs rounded px-2 py-1 truncate border ${cor.badge}`}
                                                            title={`${tarefa.titulo} (${cor.label})`}
                                                        >
                                                            {tarefa.titulo}
                                                        </div>
                                                    );
                                                })}

                                                {tarefasDoDia.length > 3 && (
                                                    <div className="text-xs text-gray-500 px-1">+{tarefasDoDia.length - 3}</div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile - Vista simplificada com bolinhas */}
                        <div className="lg:hidden">
                            <div className="grid grid-cols-7 gap-px mb-px bg-gray-200 rounded-t-lg overflow-hidden">
                                {dayNames.map((day) => (
                                    <div
                                        key={day}
                                        className="bg-blue-50 p-2 text-center font-semibold text-xs text-gray-700"
                                    >
                                        {day}
                                    </div>
                                ))} 
                            </div>

                            <div className="grid grid-cols-7 gap-px bg-gray-50 rounded-b-lg overflow-hidden">
                                {calendarDays.map((day, index) => {
                                    if (!day) {
                                        return <div key={index} className="min-h-16 bg-gray-50" />;
                                    }

                                    const dataCelula = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                    const chaveDia = toDateKey(dataCelula);
                                    const tarefasDoDia = tarefasPorDia.get(chaveDia) || [];

                                    const isToday =
                                        dataCelula.getDate() === hoje.getDate() &&
                                        dataCelula.getMonth() === hoje.getMonth() &&
                                        dataCelula.getFullYear() === hoje.getFullYear();

                                    const isSelected =
                                        dataCelula.getDate() === selectedDate.getDate() &&
                                        dataCelula.getMonth() === selectedDate.getMonth() &&
                                        dataCelula.getFullYear() === selectedDate.getFullYear();

                                    return (
                                        <button
                                            type="button"
                                            key={index}
                                            onClick={() => setSelectedDate(dataCelula)}
                                            className={`min-h-16 p-2 bg-white text-center flex flex-col items-center justify-center transition relative ${
                                                isSelected ? "ring-2 ring-inset ring-blue-500" : ""
                                            } ${isToday ? "bg-blue-100" : "hover:bg-gray-50"}`}
                                        >
                                            {/* Número do dia */}
                                            <div className={`font-semibold text-sm ${
                                                isToday ? "text-white bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center" : "text-gray-800"
                                            }`}>
                                                {day}
                                            </div>

                                            {/* Bolinhas indicando tarefas */}
                                            {tarefasDoDia.length > 0 && (
                                                <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                                                    {tarefasDoDia.slice(0, 3).map((tarefa, i) => {
                                                        const cor = corPrioridade(tarefa.prioridade);
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`w-1.5 h-1.5 rounded-full ${cor.dot}`}
                                                                title={tarefa.titulo}
                                                            />
                                                        );
                                                    })}
                                                    {tarefasDoDia.length > 3 && (
                                                        <div className="text-[10px] text-gray-500 ml-0.5">+{tarefasDoDia.length - 3}</div>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Tarefas de {dataSelecionadaLabel}</h3>
                    <span className="text-xs sm:text-sm text-gray-500">{tarefasDiaSelecionado.length} tarefa(s)</span>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">Carregando tarefas...</p>
                ) : tarefasDiaSelecionado.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhuma tarefa para o dia selecionado.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-2.5 animate-fade-in">
                        {tarefasDiaSelecionado.map((tarefa) => {
                            const cor = corPrioridade(tarefa.prioridade);
                            const estaExpandida = tarefaExpandida === tarefa.id;

                            return (
                                <div key={tarefa.id} className="border border-gray-200 rounded-md bg-white overflow-hidden ">
                                    <button
                                        type="button"
                                        onClick={() => setTarefaExpandida(estaExpandida ? null : tarefa.id)}
                                        className={`w-full px-3 py-2.5 border-l-4 ${cor.card} text-left hover:bg-gray-50 transition`}
                                    >
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cor.dot}`} />
                                                <span className="text-sm text-gray-800 truncate">{tarefa.titulo}</span>
                                            </div>
                                            <ChevronDown
                                                size={18}
                                                className={`text-gray-600 flex-shrink-0 transition-transform ${estaExpandida ? "rotate-180" : ""}`}
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row w-full justify-start gap-2 mt-2 text-xs text-gray-600">
                                            <span>Prazo: {tarefa.conclusaoPrazo}</span>
                                        </div>
                                    </button>

                                    {estaExpandida && (
                                        <div className="px-3 py-3 border-t border-gray-200 bg-gray-50 ">    
                                            <div className="space-y-2 ">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Descrição</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {tarefa.descricao || "Sem descrição"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <CadastroTarefa
                isOpen={cadastroTarefaAberto}
                onClose={() => setCadastroTarefaAberto(false)}
                onSuccess={handleCadastroTarefaSuccess}
                contexto="tarefas"
            />
        </div>
    );
};

export default Agenda;