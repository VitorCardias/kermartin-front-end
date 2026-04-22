import { useNavigate } from 'react-router-dom';

export default function PagamentoCancelado() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-xl sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Pagamento cancelado</h1>
        <p className="mx-auto mb-8 max-w-xl text-gray-600">
          A cobranca nao foi finalizada. Voce pode escolher um plano novamente quando quiser.
        </p>

        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
          <p>1. Nenhuma cobranca foi concluida.</p>
          <p>2. Seu escritorio continua sem plano ativo.</p>
          <p>3. Escolha um plano para liberar o acesso completo.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate('/planos')}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 sm:w-auto sm:px-8"
          >
            Voltar para planos
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto sm:px-8"
          >
            Ir para login
          </button>
        </div>
      </div>
    </div>
  );
}
