import CardTarefa from "../components/CardTarefa";
import Pesquisar from "../components/FiltroPesquisar";
import Titulo from "../components/Titulo";

const Tarefas: React.FC = () => {
    return (
        <div className="flex flex-col justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <Titulo tamanho="text-xl sm:text-2xl w-full sm:w-4/5 mt-4 mb-2 sm:mb-4">Gerenciamento de Tarefas</Titulo>
            <div className="w-full sm:w-4/5 bg-white rounded-lg shadow-md p-3 sm:p-6 flex flex-col">
                <Pesquisar label="Pesquisar Tarefa:" placeholder="Digite o nome da tarefa..." />
                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
                    <Pesquisar label="Demanda:" placeholder="Digite o nome da demanda..." />
                    <Pesquisar label="Funcionário:" placeholder="Digite o nome do funcionário..." />
                    <Pesquisar label="Cliente:" placeholder="Digite o nome do cliente..." />
                </div>
            </div>
            <CardTarefa 
                prioridade="alta"
            />
        </div>
    );
}

export default Tarefas;