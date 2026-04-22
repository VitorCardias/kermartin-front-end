import { useNavigate } from 'react-router-dom';

export default function PagamentoSucesso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-xl sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Pagamento confirmado</h1>
        <p className="mx-auto mb-8 max-w-xl text-gray-600">
          Sua assinatura foi processada com sucesso e o acesso ao sistema ja esta liberado.
        </p>

        <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-800">
          <p>1. Sua assinatura esta ativa.</p>
          <p>2. O acesso do escritorio foi liberado.</p>
          <p>3. Caso ja esteja logado, voce pode continuar normalmente.</p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 sm:w-auto sm:px-8"
        >
          Ir para o app
        </button>
      </div>
    </div>
  );
}
