import { useState, useEffect } from "react";
import { usePerfil } from "./usePerfil";
import { authApi } from "../api/AuthService";

type FuncionarioAPI = {
  id: string;
  emailCadastro: string;
  nomeUsuario: string;
  senha: string;
  dataInscricao: string;
  tipoUsuario: "Funcionario";
  ultimoAcesso: string | null;
  statusConta: string;
  nomeCompleto: string;
  cpf: string;
  qualificacaoFuncionario: string;
  escritorioDTO: { id: string }; // Apenas o ID do escritório
};

export type Funcionario = {
  id: string;
  emailCadastro: string;
  nomeUsuario: string;
  senha: string;
  nomeCompleto: string;
  cpf: string;
  qualificacaoFuncionario: string;
};

export type AlterarSenhaFuncionarioForm = {
  idFuncionario: string;
  novaSenha: string;
}

type PaginacaoResponse = {
  content: FuncionarioAPI[];
  totalPages: number;
};

export const useFuncionarios = () => {
  const perfil = usePerfil();
  const [funcionarios, setFuncionarios] = useState<FuncionarioAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10; // Número de funcionários por página

  // Função para buscar funcionários
  const buscarFuncionarios = async () => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      setLoading(true);
      const response = await authApi.get<PaginacaoResponse>(`/funcionario/listar-todos-por-escritorio/${perfil.idEscritorio}`, {
        params: { page: paginaAtual, size: itensPorPagina },
      });

      const funcionariosFormatados: FuncionarioAPI[] = response.data.content.map((funcionario: FuncionarioAPI) => ({
        ...funcionario,
        escritorioId: funcionario.escritorioDTO.id,
      }));

      setFuncionarios(funcionariosFormatados);
      setTotalPaginas(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setLoading(false);
    }
  };

  // Função para cadastrar um novo Funcionário
  const cadastrarFuncionario = async (novoFuncionario: Funcionario) => {
    try {
      if (!perfil?.id) {
        console.error("Erro: Perfil do usuário não encontrado.");
        return;
      }

      console.log("ID do Escritório que está sendo enviado:", perfil.idEscritorio);

      await authApi.post("/funcionario/cadastro", {
        ...novoFuncionario,
        escritorio: perfil.idEscritorio ,
      
      });

      await buscarFuncionarios(); // Recarrega a lista após o cadastro
    } catch (error) {
      console.error("Erro ao cadastrar Funcionario:", error);
      throw error;
    }
  };

  const editarFuncionario = async (funcionarioEditado: Funcionario) => {
    try {
      if (!perfil?.id) return;
      await authApi.put("/funcionario/editar", { ...funcionarioEditado });
      await buscarFuncionarios(); 
    } catch (erro) {
      console.error("Erro ao editar funcionario: ", erro);
    }
  };

const alterarSenhaFuncionario = async (alterarSenhaFuncionarioRequest: AlterarSenhaFuncionarioForm) => {
    try {
      if (!perfil?.id) return;
      await authApi.put("/funcionario/alterar-senha-funcionario", { ...alterarSenhaFuncionarioRequest });
      await buscarFuncionarios();
    } catch (erro) {
      console.error("Erro ao editar funcionario: ", erro);
    }
  };

  useEffect(() => {
    if (perfil?.id) {
      buscarFuncionarios();
    }
  }, [perfil, paginaAtual]);

  return {
    funcionarios,
    loading,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    itensPorPagina,
    cadastrarFuncionario,
    editarFuncionario,
    alterarSenhaFuncionario
  };

};