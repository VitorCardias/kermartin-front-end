import { useMemo } from "react";
import { useFuncionariosParaFiltro } from "../../../Hooks/useFuncionariosParaFiltro";
import { useClientesParaFiltro } from "../../../Hooks/useClientesParaFiltro";

interface Funcionario {
  id: string | number;
  nomeCompleto: string;
}

interface Cliente {
  id: string | number;
  nome: string;
}

interface DemandaFiltroProps {
  termoFiltro: string;
  setTermoFiltro: (termo: string) => void;
  tipoFiltro: string;
  onTipoFiltroChange: (tipo: "funcionario" | "cliente") => void;
}

const DemandaFiltro: React.FC<DemandaFiltroProps> = ({termoFiltro, setTermoFiltro, tipoFiltro, onTipoFiltroChange}) => {

  const { funcionariosParaFiltro }: { funcionariosParaFiltro: Funcionario[] } = useFuncionariosParaFiltro();
  const { clientesParaFiltro }: { clientesParaFiltro: Cliente[] } = useClientesParaFiltro();

  

  // Memoriza e padroniza a lista de opções para o dropdown.
  // Independentemente de ser 'funcionario' ou 'cliente', o objeto final terá sempre 'id' e 'label'.
  const searchOptions = useMemo(() => {
    let options: { id: string | number; label: string }[] = [];

    if (tipoFiltro === 'funcionario') {
      // Mapeia a lista de funcionários para o formato padronizado.
      options = funcionariosParaFiltro.map(func => ({
        id: func.id,
        label: func.nomeCompleto,
      }));
    } else {
      // Mapeia a lista de clientes para o mesmo formato padronizado.
      options = clientesParaFiltro.map(cli => ({
        id: cli.id,
        label: cli.nome,
      }));
    }
    
    // Ordena a lista final pelo 'label' (nome).
    return options.sort((a, b) => a.label.localeCompare(b.label));

  }, [tipoFiltro, funcionariosParaFiltro, clientesParaFiltro]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        
        {/* Dropdown de Busca */}
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            {`Selecionar ${tipoFiltro === 'funcionario' ? 'Funcionário' : 'Cliente'}`}
          </label>
          <select
            id="search"
            value={termoFiltro}
            onChange={(e) => setTermoFiltro(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          >
            <option value="">{`Todos os ${tipoFiltro === 'funcionario' ? 'Funcionários' : 'Clientes'}`}</option>
            {searchOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {/* Dropdown do Tipo de Filtro */}
        <div>
          <label htmlFor="tipoFiltro" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por
          </label>
          <select
            id="tipoFiltro"
            value={tipoFiltro}
            onChange={(e) => onTipoFiltroChange(e.target.value as 'funcionario' | 'cliente')}
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          >
            <option value="funcionario">Funcionário</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>

      </div>
    </div>
  );

}

export default DemandaFiltro;

