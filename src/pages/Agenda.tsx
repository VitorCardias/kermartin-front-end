import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const Agenda: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 18)); // Abril 2026
    const [selectedFilters, setSelectedFilters] = useState({
        demanda: 'Todas as Demandas',
        cliente: 'Todos os Clientes',
        funcionario: 'Todos os Funcionarios',
        prioridade: []
    });

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date(2026, 3, 18));
    };

    const generateCalendarDays = () => {
        const days = [];
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
    const today = 18;
    const isCurrentMonth = currentDate.getMonth() === 3 && currentDate.getFullYear() === 2026;

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 bg-gray-50 min-h-screen">
            {/* Filtros - Sidebar */}
            <div className="w-full lg:w-80 space-y-6">
                {/* Buscar Tarefa */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        BUSCAR TAREFA
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Revisão de FOTS"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Demanda */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        DEMANDA
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option>Todas as Demandas</option>
                    </select>
                </div>

                {/* Cliente */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        CLIENTE
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option>Todos os Clientes</option>
                    </select>
                </div>

                {/* Funcionário */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        FUNCIONÁRIO
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option>Todos os Funcionarios</option>
                    </select>
                </div>

                {/* Prioridade */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                        PRIORIDADE
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">ALTA (VERMELHO)</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 text-amber-500" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">MÉDIA (AMARELO)</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">BAIXA (AZUL)</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Calendário */}
            <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                    {/* Header com navegação */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
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
                            <button className="ml-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition flex items-center gap-2">
                                <Plus size={16} />
                                <span className="hidden sm:inline">Nova Tarefa</span>
                            </button>
                        </div>
                    </div>

                    {/* Grid do calendário */}
                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            {/* Cabeçalho dos dias da semana */}
                            <div className="grid grid-cols-7 gap-px mb-px bg-gray-200 rounded-t-lg overflow-hidden">
                                {dayNames.map((day) => (
                                    <div
                                        key={day}
                                        className="bg-gray-100 p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm text-gray-700"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Dias do calendário */}
                            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg overflow-hidden">
                                {calendarDays.map((day, index) => (
                                    <div
                                        key={index}
                                        className={`min-h-20 sm:min-h-24 p-2 sm:p-3 ${
                                            day ? 'bg-white' : 'bg-gray-50'
                                        } ${
                                            day && isCurrentMonth && day === today
                                                ? 'ring-2 ring-inset ring-blue-400'
                                                : ''
                                        }`}
                                    >
                                        {day && (
                                            <>
                                                <div className="font-semibold text-sm sm:text-base text-gray-800 mb-1">
                                                    {day}
                                                </div>
                                                {/* Espaço para tarefas */}
                                                <div className="space-y-1">
                                                    {/* Exemplo de tarefa */}
                                                    {day === 10 && (
                                                        <div className="text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-1 truncate border-l-2 border-yellow-400">
                                                            Reunião Vitar
                                                        </div>
                                                    )}
                                                    {day === 12 && (
                                                        <>
                                                            <div className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 truncate border-l-2 border-blue-400">
                                                                Contato: Kubix LTDA
                                                            </div>
                                                        </>
                                                    )}
                                                    {day === 13 && (
                                                        <>
                                                            <div className="text-xs bg-red-100 text-red-800 rounded px-2 py-1 truncate border-l-2 border-red-400">
                                                                Prazos: Recursos Musta
                                                            </div>
                                                            <div className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 truncate border-l-2 border-blue-400">
                                                                Contato: Kubix LTDA
                                                            </div>
                                                            <div className="text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-1 truncate border-l-2 border-yellow-400">
                                                                Revisão FGTS
                                                            </div>
                                                            <div className="text-xs text-gray-600 px-2 py-1">
                                                                +2 Tarefas
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Agenda;