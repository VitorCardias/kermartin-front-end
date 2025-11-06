import React, { useState } from 'react';
import { authApi } from '../../api/AuthService';
import type { Demanda } from '../../hooks/useDemandas'; // Importe seu tipo Demanda

// O componente recebe os dados da demanda principal
type RelatoriosDemandaProps = {
  demanda: Demanda;
};

const RelatoriosDemanda: React.FC<RelatoriosDemandaProps> = ({ demanda }) => {
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleGerarRelatorio = async () => {
    setGerandoPdf(true);
    setErro(null);
    try {
      // 1. Chama a API
      const response = await authApi.get(
        `/relatorios/demanda/${demanda.id}`, 
        {
          responseType: 'blob', // Importante para arquivos
        }
      );

      // 2. Cria o Blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // 3. Cria a URL temporária
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // 4. Cria o link <a>
      const link = document.createElement('a');
      link.href = downloadUrl;
      const nomeArquivo = `relatorio_${demanda.titulo.replace(/\s+/g, '_')}.pdf`;
      link.setAttribute('download', nomeArquivo); 
      
      // 5. Inicia o download
      document.body.appendChild(link);
      link.click();
      
      // 6. Limpa a memória
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Erro ao gerar relatório em PDF:", error);
      setErro("Não foi possível gerar o relatório. Tente novamente.");
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto text-gray-900 p-6">
      <h4 className="text-2xl font-semibold mb-6">Relatórios da Demanda</h4>
      
      <p className="text-gray-600 mb-6">
        Gere um relatório completo (PDF) desta demanda, incluindo suas etapas e tarefas, 
        para compartilhar com seu cliente.
      </p>

      {/* Mostra uma mensagem de erro se a geração falhar */}
      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{erro}</span>
        </div>
      )}

      {/* Botão de Gerar Relatório */}
      <button
        onClick={handleGerarRelatorio}
        disabled={gerandoPdf}
        className="px-6 py-3 bg-gray-900 text-white rounded-md transition hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        {gerandoPdf ? 'Gerando PDF...' : 'Baixar Relatório da Demanda'}
      </button>

    </div>
  );
};

export default RelatoriosDemanda;