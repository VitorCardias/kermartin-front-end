import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/AuthService';
import { useAuth } from '../Hooks/useAuth';
import { useToast } from '../components/Toast';

type PlanoApi = {
  id: string;
  nome: string;
  descricao?: string;
};

type PlanoUi = {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  recursos: string[];
  destaque?: boolean;
};

const recursosPorNome: Record<string, string[]> = {
  basico: ['Ate 3 funcionarios', 'Agenda de prazos', 'Gerenciamento de tarefas'],
  pro: ['Ate 10 funcionarios', 'Agenda de prazos', 'Gerenciamento de tarefas'],
  business: ['Funcionarios ilimitados', 'Tudo do plano PRO', 'Atendimento dedicado'],
};

const fallbackRecursos = ['Agenda de prazos', 'Gestao de tarefas', 'Suporte por e-mail'];

export default function Planos() {
  const navigate = useNavigate();
  const { estaAutenticado, perfil } = useAuth();
  const { showToast } = useToast();

  const [planos, setPlanos] = useState<PlanoUi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [temPagamentoPendente, setTemPagamentoPendente] = useState(false);
  const phoneWhatsapp = '5555991416956';

  const usuarioFuncionario = perfil?.tipoUsuario === 'Funcionario';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTemPagamentoPendente(params.get('paymentPending') === 'true');
  }, []);

  useEffect(() => {
    const carregarPlanos = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const response = await authApi.get<PlanoApi[]>('/plano');
        const data = Array.isArray(response.data) ? response.data : [];

        const planosMontados: PlanoUi[] = data.slice(0, 2).map((plano, index) => {
          const nomeBase = plano.nome?.toLowerCase() || '';
          const recursos =
            nomeBase.includes('pro')
              ? recursosPorNome.pro
              : nomeBase.includes('basico') || nomeBase.includes('simples')
                ? recursosPorNome.basico
                : index === 0
                  ? recursosPorNome.basico
                  : fallbackRecursos;

          return {
            id: plano.id,
            nome: index === 0 ? 'Simples' : 'Pro',
            preco: index === 0 ? 19.9 : 59.9,
            descricao: plano.descricao || 'Plano ideal para o seu escritorio.',
            recursos,
            destaque: index === 1,
          };
        });

        setPlanos(planosMontados);
      } catch (err: any) {
        const msg = err.response?.data?.erro || err.response?.data?.message || 'Erro ao carregar planos.';
        setErro(msg);
      } finally {
        setCarregando(false);
      }
    };

    void carregarPlanos();
  }, []);

  const tituloPagina = useMemo(() => {
    if (usuarioFuncionario) {
      return 'Seu escritorio esta sem plano ativo';
    }

    if (temPagamentoPendente) {
      return 'Pagamento pendente';
    }

    return 'Escolha seu plano';
  }, [temPagamentoPendente, usuarioFuncionario]);

  const handleAssinar = async (planoId: string) => {
    if (!estaAutenticado) {
      navigate('/cadastro');
      return;
    }

    if (usuarioFuncionario) {
      showToast('Apenas o escritorio pode contratar ou alterar planos.', 'info');
      return;
    }

    setProcessandoId(planoId);
    setErro(null);

    try {
      const response = await authApi.post(`/assinaturas/gerar-link-pagamento?planoId=${planoId}`);
      if (response.data?.url) {
        window.location.href = response.data.url;
        return;
      }
      setErro('Nao foi possivel gerar o link de pagamento.');
    } catch (err: any) {
      const msg =
        err.response?.data?.erro || err.response?.data?.message || 'Erro ao processar assinatura. Tente novamente.';
      setErro(msg);
    } finally {
      setProcessandoId(null);
    }
  };

  const handleAssinarBusiness = () => {
    const nomeEscritorio = perfil?.nomeEscritorio || 'meu escritorio';
    const mensagem = encodeURIComponent(
      `Ola! Tenho interesse no Plano Business da Kermartin para ${nomeEscritorio}.`
    );
    window.open(`https://wa.me/${phoneWhatsapp}?text=${mensagem}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{tituloPagina}</h1>
          <p className="mt-2 text-gray-600">
            {usuarioFuncionario
              ? 'Entre em contato com o responsavel do escritorio para regularizar a assinatura.'
              : 'Selecione um plano para ativar ou regularizar o acesso da sua conta.'}
          </p>
        </div>

        {temPagamentoPendente && !usuarioFuncionario && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
            Seu escritorio possui pagamento pendente. Escolha um plano para continuar usando o app.
          </div>
        )}

        {usuarioFuncionario && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800">
            Este usuario e do tipo funcionario e nao pode contratar plano. O escritorio precisa regularizar a assinatura.
          </div>
        )}

        {erro && <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800">{erro}</div>}

        {carregando ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-white shadow-lg">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {planos.map((plano) => (
              <article
                key={plano.id}
                className={`flex flex-col rounded-2xl border bg-white p-6 shadow-lg transition ${
                  plano.destaque ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-gray-100'
                }`}
              >
                {plano.destaque && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Mais escolhido
                  </span>
                )}

                <h3 className="text-xl font-bold text-gray-900">{plano.nome}</h3>

                <div className="my-5">
                  <span className="text-3xl font-bold text-gray-900">R$ {plano.preco.toFixed(2).replace('.', ',')}</span>
                  <span className="ml-2 text-gray-500">/mês</span>
                </div>

                <p className="mb-5 text-sm text-gray-600">{plano.descricao}</p>

                <ul className="mb-6 space-y-2 text-sm text-gray-700">
                  {plano.recursos.map((recurso) => (
                    <li key={`${plano.id}-${recurso}`} className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-600">•</span>
                      <span>{recurso}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleAssinar(plano.id)}
                  disabled={!!processandoId || usuarioFuncionario}
                  className="mt-auto w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {processandoId === plano.id ? 'Processando...' : 'Assinar plano'}
                </button>
              </article>
            ))}

            <article className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition">
              <span className="mb-4 inline-flex w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                Plano personalizado
              </span>

              <h3 className="text-xl font-bold text-gray-900">Business</h3>

              <div className="my-5">
                <span className="text-3xl font-bold text-gray-900">Sob consulta</span>
              </div>

              <p className="mb-5 text-sm text-gray-600">
                Plano sob medida para escritorios com operacao especifica.
              </p>

              <ul className="mb-6 space-y-2 text-sm text-gray-700">
                {recursosPorNome.business.map((recurso) => (
                  <li key={`business-${recurso}`} className="flex items-start gap-2">
                    <span className="mt-1 text-violet-600">•</span>
                    <span>{recurso}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleAssinarBusiness}
                className="mt-auto w-full rounded-lg bg-violet-600 py-2.5 font-semibold text-white transition hover:bg-violet-700"
              >
                Assinar plano
              </button>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
