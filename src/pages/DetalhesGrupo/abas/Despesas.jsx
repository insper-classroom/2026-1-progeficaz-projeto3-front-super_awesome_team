import { useCallback, useEffect, useMemo, useState } from "react";
import DespesaForm from "../../../components/DespesaForm";
import DespesaCard from "../../../components/DespesaCard";
import EstadoVazio from "../../../components/EstadoVazio";
import Button from "../../../components/Button";
import { useUser } from "../../../hooks/useUser";
import {
  atualizarContaGrupo,
  criarContaGrupo,
  listarContasDoGrupo,
  marcarContaComoPaga,
} from "../../../services/billService";
import {
  confirmarPagamentoComoDevedor,
  confirmarRecebimentoComoCredor,
  listarPendenciasDoGrupo,
} from "../../../services/pendencyService";
import styles from "./Despesas.module.css";

const ITENS_POR_PAGINA = 6;

const filtrosDespesas = [
  { id: "abertas", label: "Abertas" },
  { id: "minhas", label: "Minhas pendências" },
  { id: "vencidas", label: "Vencidas" },
  { id: "concluidas", label: "Concluídas" },
];

const formatadorMes = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const LIMITE_HISTORICO_RECENTE = 6;

function calcularStatus(despesa) {
  if (typeof despesa?.concluida === "boolean") {
    return despesa.concluida ? "concluida" : "nao_concluida";
  }
  if (despesa?.paga) return "concluida";

  const membros = Array.isArray(despesa?.membros) ? despesa.membros : [];
  if (membros.length === 0) return "nao_concluida";
  return membros.every((m) => m.pago) ? "concluida" : "nao_concluida";
}

function criarHistorico(despesas) {
  return despesas
    .map((despesa, index) => ({
      id: despesa.id || `historico-${index}`,
      nome: despesa.nome,
      valor: despesa.total,
      status: calcularStatus(despesa),
      criadaEm: despesa.criadaEm,
      dueDate: despesa.dueDate,
      ordemOriginal: index,
      despesa,
    }))
    .sort((a, b) => {
      const dataA = new Date(a.criadaEm).getTime();
      const dataB = new Date(b.criadaEm).getTime();

      if (Number.isFinite(dataA) && Number.isFinite(dataB)) {
        return dataB - dataA;
      }

      return b.ordemOriginal - a.ordemOriginal;
    });
}

function nomeDoEmail(email) {
  if (!email) return "Credor";
  return email.split("@")[0];
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obterDataValida(valor) {
  if (!valor) return null;

  const texto = String(valor);
  const parteData = texto.split("T")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(parteData)) {
    const [ano, mes, dia] = parteData.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return data;
}

function obterDataReferencia(despesa) {
  return obterDataValida(despesa?.dueDate) || obterDataValida(despesa?.criadaEm);
}

function obterDataRegistro(despesa) {
  return obterDataValida(despesa?.criadaEm);
}

function obterChaveDia(data) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, "0"),
    String(data.getDate()).padStart(2, "0"),
  ].join("-");
}

function obterChaveMes(despesa) {
  const data = obterDataReferencia(despesa);
  if (!data) return "sem-data";

  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function formatarMes(chaveMes) {
  if (chaveMes === "sem-data") return "Sem data";

  const [ano, mes] = chaveMes.split("-").map(Number);
  const texto = formatadorMes.format(new Date(ano, mes - 1, 1));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function ordenarChavesMes(a, b) {
  if (a === "sem-data") return 1;
  if (b === "sem-data") return -1;
  return b.localeCompare(a);
}

function ordenarPorDataReferencia(a, b) {
  const dataA = obterDataReferencia(a)?.getTime() || 0;
  const dataB = obterDataReferencia(b)?.getTime() || 0;
  return dataB - dataA;
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function despesaVencida(despesa) {
  if (despesa?.concluida) return false;

  const prazo = obterDataValida(despesa?.dueDate);
  if (!prazo) return false;

  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return prazo < inicioHoje;
}

function usuarioTemPendencia(despesa, usuarioEmail) {
  if (!usuarioEmail || despesa?.concluida) return false;

  return (despesa?.membros || []).some((membro) => {
    const pendente = !membro.pago && !membro.resolvida;
    return membro.email === usuarioEmail && membro.papel !== "credor" && pendente;
  });
}

function textoBuscaDespesa(despesa) {
  const membros = (despesa?.membros || [])
    .map((membro) => `${membro.nome || ""} ${membro.email || ""}`)
    .join(" ");

  return normalizarTexto(
    `${despesa?.nome || ""} ${despesa?.credorNome || ""} ${despesa?.credorEmail || ""} ${membros}`
  );
}

function agruparPorMes(despesas) {
  const grupos = new Map();

  despesas.forEach((despesa) => {
    const chaveMes = obterChaveMes(despesa);
    const despesasDoMes = grupos.get(chaveMes) || [];
    despesasDoMes.push(despesa);
    grupos.set(chaveMes, despesasDoMes);
  });

  return [...grupos.entries()].map(([chave, itens]) => ({
    chave,
    titulo: formatarMes(chave),
    itens,
  }));
}

function obterEstadoVazio(filtroAtivo, busca) {
  if (busca.trim()) {
    return {
      titulo: "Nenhuma conta encontrada",
      detalhe: "Tente buscar por outro nome, membro ou credor.",
    };
  }

  if (filtroAtivo === "abertas") {
    return {
      titulo: "Nenhuma despesa aberta",
      detalhe: "As contas pendentes do grupo aparecerão aqui.",
    };
  }

  if (filtroAtivo === "minhas") {
    return {
      titulo: "Nenhuma pendência sua",
      detalhe: "Quando você tiver algo para pagar, a conta aparece aqui.",
    };
  }

  if (filtroAtivo === "vencidas") {
    return {
      titulo: "Nenhuma despesa vencida",
      detalhe: "As contas fora do prazo aparecerão neste filtro.",
    };
  }

  if (filtroAtivo === "concluidas") {
    return {
      titulo: "Nenhuma despesa concluída",
      detalhe: "As contas finalizadas do grupo aparecerão aqui.",
    };
  }

  return {
    titulo: "Nenhuma conta encontrada",
    detalhe: "Altere os filtros ou registre uma nova despesa.",
  };
}

function obterMesMapaCalor(chaveMes) {
  if (/^\d{4}-\d{2}$/.test(chaveMes)) {
    const [ano, mes] = chaveMes.split("-").map(Number);
    return { ano, mesIndex: mes - 1, chave: chaveMes };
  }

  const hoje = new Date();
  return {
    ano: hoje.getFullYear(),
    mesIndex: hoje.getMonth(),
    chave: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`,
  };
}

function calcularNivelMapa(valor, maiorValor) {
  if (!valor || !maiorValor) return 0;

  const proporcao = valor / maiorValor;
  if (proporcao >= 0.76) return 4;
  if (proporcao >= 0.51) return 3;
  if (proporcao >= 0.26) return 2;
  return 1;
}

function montarMapaCalor(despesas, chaveMes) {
  const { ano, mesIndex, chave } = obterMesMapaCalor(chaveMes);
  const primeiroDia = new Date(ano, mesIndex, 1);
  const diasNoMes = new Date(ano, mesIndex + 1, 0).getDate();
  const totaisPorDia = new Map();

  despesas.forEach((despesa) => {
    const data = obterDataRegistro(despesa);
    if (!data || data.getFullYear() !== ano || data.getMonth() !== mesIndex) return;

    const chaveDia = obterChaveDia(data);
    totaisPorDia.set(chaveDia, (totaisPorDia.get(chaveDia) || 0) + Number(despesa.total || 0));
  });

  const valores = [...totaisPorDia.values()];
  const maiorValor = valores.length > 0 ? Math.max(...valores) : 0;
  const totalMes = valores.reduce((total, valor) => total + valor, 0);
  const maiorEntrada = [...totaisPorDia.entries()].sort(([, valorA], [, valorB]) => valorB - valorA)[0];
  const celulas = [];

  for (let i = 0; i < primeiroDia.getDay(); i += 1) {
    celulas.push({ tipo: "vazio", id: `vazio-${i}` });
  }

  for (let dia = 1; dia <= diasNoMes; dia += 1) {
    const data = new Date(ano, mesIndex, dia);
    const chaveDia = obterChaveDia(data);
    const valor = totaisPorDia.get(chaveDia) || 0;

    celulas.push({
      tipo: "dia",
      id: chaveDia,
      dia,
      valor,
      nivel: calcularNivelMapa(valor, maiorValor),
    });
  }

  return {
    titulo: formatarMes(chave),
    totalMes,
    maiorValor,
    maiorDia: maiorEntrada ? Number(maiorEntrada[0].split("-")[2]) : null,
    diasComDespesa: totaisPorDia.size,
    celulas,
  };
}

function normalizarDespesaComGrupo(despesa, grupo) {
  const membrosGrupo = grupo?.membros || [];
  const credorGrupo = membrosGrupo.find(
    (item) => item.email === despesa.criadaPor || item.id === despesa.criadaPor
  );

  return {
    ...despesa,
    credorNome: credorGrupo?.nome || nomeDoEmail(despesa.criadaPor),
    membros: (despesa.membros || []).map((membro, index) => {
      const membroGrupo = membrosGrupo.find(
        (item) =>
          item.email === membro.email ||
          item.id === membro.email ||
          item.nome === membro.nome
      );

      return {
        ...membro,
        email: membro.email || membroGrupo?.email || membroGrupo?.id || membro.nome,
        nome: membroGrupo?.nome || membro.nome,
        cor: membro.cor || membroGrupo?.cor,
        percentual: membro.percentual || (despesa.total ? (membro.valor / despesa.total) * 100 : 0),
        pago: Boolean(despesa.paga || membro.pago),
        id: membro.id || membro.email || index,
      };
    }),
  };
}

function agruparPendenciasPorConta(pendencias) {
  return pendencias.reduce((mapa, pendencia) => {
    const pendenciasDaConta = mapa.get(pendencia.billId) || [];
    pendenciasDaConta.push(pendencia);
    mapa.set(pendencia.billId, pendenciasDaConta);
    return mapa;
  }, new Map());
}

function aplicarPendenciasNaDespesa(despesa, pendencias) {
  const credorEmail = despesa.criadaPor;

  const membros = despesa.membros.map((membro) => {
    const pendencia = pendencias.find(
      (item) => item.devedorEmail === membro.email
    );
    const ehCredor = membro.email === credorEmail;
    const resolvida = pendencia ? pendencia.resolvida : Boolean(despesa.paga || ehCredor);

    return {
      ...membro,
      papel: ehCredor ? "credor" : "devedor",
      pendenciaId: pendencia?.id,
      credorEmail,
      devedorConfirmou: pendencia?.devedorConfirmou ?? false,
      credorConfirmou: pendencia?.credorConfirmou ?? false,
      devedorConfirmouEm: pendencia?.devedorConfirmouEm,
      credorConfirmouEm: pendencia?.credorConfirmouEm,
      resolvida,
      pago: resolvida,
    };
  });

  const devedores = membros.filter((membro) => membro.email !== credorEmail);
  const concluida = Boolean(despesa.paga) || (
    devedores.length === 0
      ? true
      : devedores.every((membro) => membro.resolvida)
  );

  return {
    ...despesa,
    credorEmail,
    pendencias,
    membros,
    concluida,
  };
}

export function Despesas({ grupoId, grupo }) {
  const { usuario } = useUser();
  const [despesas, setDespesas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [modal, setModal] = useState({
    aberto: false,
    tipo: null,
    despesa: null,
  });
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoPendenciaId, setConfirmandoPendenciaId] = useState(null);
  const [concluindoDespesaId, setConcluindoDespesaId] = useState(null);
  const [erro, setErro] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("abertas");
  const [busca, setBusca] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("todos");
  const [quantidadeVisivel, setQuantidadeVisivel] = useState(ITENS_POR_PAGINA);

  const carregarContas = useCallback(async () => {
    if (!grupoId) return;

    setCarregando(true);
    setErro("");

    try {
      const [contas, pendencias] = await Promise.all([
        listarContasDoGrupo(grupoId),
        listarPendenciasDoGrupo(grupoId),
      ]);
      const pendenciasPorConta = agruparPendenciasPorConta(pendencias);
      const contasNormalizadas = contas
        .map((conta) => normalizarDespesaComGrupo(conta, grupo))
        .map((conta) =>
          aplicarPendenciasNaDespesa(
            conta,
            pendenciasPorConta.get(conta.id) || []
          )
        );
      setDespesas(contasNormalizadas);
      setHistorico(criarHistorico(contasNormalizadas));
    } catch (error) {
      setDespesas([]);
      setHistorico([]);
      setErro(error.response?.data?.error || "Não foi possível carregar as contas do backend.");
    } finally {
      setCarregando(false);
    }
  }, [grupo, grupoId]);

  useEffect(() => {
    Promise.resolve().then(carregarContas);
  }, [carregarContas]);

  const contadoresFiltros = useMemo(() => {
    return {
      abertas: despesas.filter((despesa) => !despesa.concluida).length,
      minhas: despesas.filter((despesa) =>
        usuarioTemPendencia(despesa, usuario?.email)
      ).length,
      vencidas: despesas.filter(despesaVencida).length,
      concluidas: despesas.filter((despesa) => despesa.concluida).length,
    };
  }, [despesas, usuario?.email]);

  const opcoesMes = useMemo(() => {
    const chaves = [...new Set(despesas.map(obterChaveMes))].sort(ordenarChavesMes);

    return [
      { valor: "todos", label: "Todos os meses" },
      ...chaves.map((chave) => ({
        valor: chave,
        label: formatarMes(chave),
      })),
    ];
  }, [despesas]);

  const despesasFiltradas = useMemo(() => {
    const termoBusca = normalizarTexto(busca);

    return despesas
      .filter((despesa) => {
        if (filtroAtivo === "abertas") return !despesa.concluida;
        if (filtroAtivo === "minhas") return usuarioTemPendencia(despesa, usuario?.email);
        if (filtroAtivo === "vencidas") return despesaVencida(despesa);
        if (filtroAtivo === "concluidas") return despesa.concluida;
        return true;
      })
      .filter((despesa) => {
        if (mesSelecionado === "todos") return true;
        return obterChaveMes(despesa) === mesSelecionado;
      })
      .filter((despesa) => {
        if (!termoBusca) return true;
        return textoBuscaDespesa(despesa).includes(termoBusca);
      })
      .sort(ordenarPorDataReferencia);
  }, [busca, despesas, filtroAtivo, mesSelecionado, usuario?.email]);

  const despesasVisiveis = useMemo(() => {
    return despesasFiltradas.slice(0, quantidadeVisivel);
  }, [despesasFiltradas, quantidadeVisivel]);

  const gruposDespesas = useMemo(() => {
    return agruparPorMes(despesasVisiveis);
  }, [despesasVisiveis]);

  const estadoVazio = useMemo(() => {
    return obterEstadoVazio(filtroAtivo, busca);
  }, [busca, filtroAtivo]);

  const mapaCalor = useMemo(() => {
    return montarMapaCalor(despesas, mesSelecionado);
  }, [despesas, mesSelecionado]);

  const historicoRecente = useMemo(() => {
    return historico.slice(0, LIMITE_HISTORICO_RECENTE);
  }, [historico]);

  const podeCarregarMais = quantidadeVisivel < despesasFiltradas.length;

  function abrirNovaDespesa() {
    setErro("");
    setErroFormulario("");
    setModal({
      aberto: true,
      tipo: "form",
      despesa: null,
    });
  }

  function abrirDetalhe(despesa) {
    setModal({
      aberto: true,
      tipo: "detalhe",
      despesa,
    });
  }

  function alterarFiltro(filtro) {
    setFiltroAtivo(filtro);
    setQuantidadeVisivel(ITENS_POR_PAGINA);
  }

  function alterarBusca(valor) {
    setBusca(valor);
    setQuantidadeVisivel(ITENS_POR_PAGINA);
  }

  function alterarMes(valor) {
    setMesSelecionado(valor);
    setQuantidadeVisivel(ITENS_POR_PAGINA);
  }

  function abrirDetalheHistorico(despesa) {
    setModal({
      aberto: true,
      tipo: "detalhe",
      despesa,
    });
  }

  function abrirEdicao(despesa) {
    setErro("");
    setErroFormulario("");
    setModal({
      aberto: true,
      tipo: "form",
      despesa,
    });
  }

  function fecharModal() {
    setErroFormulario("");
    setModal({
      aberto: false,
      tipo: null,
      despesa: null,
    });
  }

  async function salvarDespesa(despesaSalva) {
    setErro("");
    setErroFormulario("");

    if (!grupoId) {
      setErroFormulario("Grupo não encontrado para salvar a conta.");
      return;
    }

    setSalvando(true);
    try {
      if (modal.despesa?.id) {
        await atualizarContaGrupo(modal.despesa.id, despesaSalva);
      } else {
        await criarContaGrupo({
          grupoId,
          nome: despesaSalva.nome,
          total: despesaSalva.total,
          dueDate: despesaSalva.dueDate,
          pixKey: despesaSalva.pixKey,
          membros: despesaSalva.membros,
        });
      }

      await carregarContas();
      fecharModal();
    } catch (error) {
      setErroFormulario(error.response?.data?.error || "Não foi possível salvar a conta.");
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarPagamentoMembro(membro) {
    setErro("");

    if (!membro?.pendenciaId) {
      setErro("Pendência não encontrada para confirmar.");
      return;
    }

    const usuarioEmail = usuario?.email;
    const ehDevedor = membro.email === usuarioEmail;
    const ehCredor = membro.credorEmail === usuarioEmail;

    if (!ehDevedor && !ehCredor) {
      setErro("Apenas o credor ou o devedor podem confirmar este pagamento.");
      return;
    }

    setConfirmandoPendenciaId(membro.pendenciaId);
    try {
      if (ehCredor) {
        await confirmarRecebimentoComoCredor(membro.pendenciaId);
      } else {
        await confirmarPagamentoComoDevedor(membro.pendenciaId);
      }

      await carregarContas();
      fecharModal();
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível confirmar o pagamento.");
    } finally {
      setConfirmandoPendenciaId(null);
    }
  }

  async function concluirDespesaComoCredor(despesa) {
    setErro("");

    if (!despesa?.id) {
      setErro("Conta não encontrada para concluir.");
      return;
    }

    if (despesa.credorEmail !== usuario?.email) {
      setErro("Apenas o credor pode concluir esta despesa.");
      return;
    }

    setConcluindoDespesaId(despesa.id);
    try {
      await marcarContaComoPaga(despesa.id);
      await carregarContas();
      fecharModal();
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível concluir a despesa.");
    } finally {
      setConcluindoDespesaId(null);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {carregando && <p>Carregando despesas...</p>}
        {erro && <p>{erro}</p>}

        {modal.aberto && modal.tipo === "form" && (
          <DespesaForm
            initialData={modal.despesa}
            modo={modal.despesa ? "edit" : "create"}
            membrosDoGrupo={grupo?.membros}
            onSave={salvarDespesa}
            onClose={fecharModal}
            salvando={salvando}
            erroExterno={erroFormulario}
          />
        )}

        <div className={styles.filtrosArea}>
          <div className={styles.ferramentas}>
            <input
              className={styles.busca}
              type="search"
              placeholder="Buscar por nome, membro ou credor"
              value={busca}
              onChange={(e) => alterarBusca(e.target.value)}
            />

            <select
              className={styles.selectMes}
              value={mesSelecionado}
              onChange={(e) => alterarMes(e.target.value)}
            >
              {opcoesMes.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.label}
                </option>
              ))}
            </select>

            <div className={styles.acaoPrincipal}>
              <Button onClick={abrirNovaDespesa}>+ Nova despesa</Button>
            </div>
          </div>

          <div className={styles.filtrosStatus} aria-label="Filtrar despesas">
            {filtrosDespesas.map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                className={
                  filtroAtivo === filtro.id
                    ? styles.filtroAtivo
                    : styles.filtroBotao
                }
                onClick={() => alterarFiltro(filtro.id)}
              >
                {filtro.label}
                <span>{contadoresFiltros[filtro.id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.resultadoInfo}>
          <span>
            {despesasFiltradas.length}{" "}
            {despesasFiltradas.length === 1 ? "conta encontrada" : "contas encontradas"}
          </span>
          {despesasFiltradas.length > despesasVisiveis.length && (
            <span>
              mostrando {despesasVisiveis.length} de {despesasFiltradas.length}
            </span>
          )}
        </div>

        {gruposDespesas.length > 0 ? (
          <div className={styles.listaAgrupada}>
            {gruposDespesas.map((grupoMes) => (
              <section key={grupoMes.chave} className={styles.grupoMes}>
                <div className={styles.grupoMesCabecalho}>
                  <span>{grupoMes.titulo}</span>
                  <small>
                    {grupoMes.itens.length}{" "}
                    {grupoMes.itens.length === 1 ? "conta" : "contas"}
                  </small>
                </div>

                <div className={styles.gridDespesas}>
                  {grupoMes.itens.map((despesa) => (
                    <DespesaCard
                      key={despesa.id}
                      despesa={despesa}
                      aberto={false}
                      onOpen={() => abrirDetalhe(despesa)}
                      onClose={fecharModal}
                      onEdit={() => abrirEdicao(despesa)}
                      onConfirmarPagamento={confirmarPagamentoMembro}
                      onConcluirDespesa={concluirDespesaComoCredor}
                      usuarioEmail={usuario?.email}
                      confirmandoPendenciaId={confirmandoPendenciaId}
                      concluindoDespesaId={concluindoDespesaId}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EstadoVazio
            classe={styles.estadoVazio}
            titulo={estadoVazio.titulo}
            descricao={estadoVazio.detalhe}
            rotuloAcao="Nova despesa"
            aoAcionar={abrirNovaDespesa}
          />
        )}

        {podeCarregarMais && (
          <div className={styles.carregarMaisArea}>
            <button
              type="button"
              className={styles.botaoCarregarMais}
              onClick={() =>
                setQuantidadeVisivel((quantidade) => quantidade + ITENS_POR_PAGINA)
              }
            >
              Carregar mais
            </button>
          </div>
        )}

        {modal.aberto && modal.tipo === "detalhe" && modal.despesa && (
          <DespesaCard
            despesa={modal.despesa}
            aberto={modal.aberto}
            somenteModal
            onClose={fecharModal}
            onEdit={() => abrirEdicao(modal.despesa)}
            onConfirmarPagamento={confirmarPagamentoMembro}
            onConcluirDespesa={concluirDespesaComoCredor}
            usuarioEmail={usuario?.email}
            confirmandoPendenciaId={confirmandoPendenciaId}
            concluindoDespesaId={concluindoDespesaId}
          />
        )}
      </main>

      <aside className={styles.colunaLateral}>
        <section className={styles.mapaCalor}>
          <div className={styles.mapaCalorCabecalho}>
            <div>
              <h3 className={styles.mapaCalorTitle}>Mapa de calor</h3>
              <p>{mapaCalor.titulo}</p>
            </div>

            <span>{formatarMoeda(mapaCalor.totalMes)}</span>
          </div>

          <div className={styles.mapaCalorResumo}>
            <div>
              <span>Maior dia</span>
              <strong>
                {mapaCalor.maiorDia
                  ? `${String(mapaCalor.maiorDia).padStart(2, "0")} - ${formatarMoeda(mapaCalor.maiorValor)}`
                  : "Sem despesas"}
              </strong>
            </div>
            <div>
              <span>Dias com despesa</span>
              <strong>{mapaCalor.diasComDespesa}</strong>
            </div>
          </div>

          <div className={styles.mapaCalorSemana}>
            {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, index) => (
              <span key={`${dia}-${index}`}>{dia}</span>
            ))}
          </div>

          <div className={styles.mapaCalorGrade}>
            {mapaCalor.celulas.map((celula) => {
              if (celula.tipo === "vazio") {
                return <span key={celula.id} className={styles.mapaCalorVazio} />;
              }

              return (
                <span
                  key={celula.id}
                  className={`${styles.mapaCalorDia} ${styles[`mapaCalorNivel${celula.nivel}`]}`}
                  tabIndex={0}
                  aria-label={`${String(celula.dia).padStart(2, "0")}: ${formatarMoeda(celula.valor)}`}
                >
                  {celula.dia}
                  <span className={styles.mapaCalorTooltip}>
                    <strong>Dia {String(celula.dia).padStart(2, "0")}</strong>
                    <span>{formatarMoeda(celula.valor)}</span>
                  </span>
                </span>
              );
            })}
          </div>

          <div className={styles.mapaCalorLegenda}>
            <span>Menor gasto</span>
            <div>
              {[0, 1, 2, 3, 4].map((nivel) => (
                <span
                  key={nivel}
                  className={`${styles.mapaCalorLegendaItem} ${styles[`mapaCalorNivel${nivel}`]}`}
                />
              ))}
            </div>
            <span>Maior gasto</span>
          </div>
        </section>

        <section className={styles.historico}>
          <div className={styles.historicoCabecalho}>
            <h3 className={styles.historicoTitle}>Atividade recente</h3>
            {historico.length > 0 && (
              <span>Últimas {Math.min(historico.length, LIMITE_HISTORICO_RECENTE)}</span>
            )}
          </div>

          <div className={styles.historicoLista}>
          {historicoRecente.length > 0 ? (
            historicoRecente.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.historicoItem}
                onClick={() => abrirDetalheHistorico(item.despesa)}
              >
                <div>
                  <strong className={styles.historicoNome}>{item.nome}</strong>
                  <p className={styles.historicoValor}>{formatarMoeda(item.valor)}</p>
                  {item.dueDate && (
                    <p className={styles.historicoPrazo}>
                      Prazo: {String(item.dueDate).split("T")[0]}
                    </p>
                  )}
                </div>

                <span
                  className={
                    item.status === "concluida"
                      ? styles.badgeConcluida
                      : styles.badgePendente
                  }
                >
                  {item.status === "concluida" ? "Concluída" : "Não concluída"}
                </span>
              </button>
            ))
          ) : (
            <EstadoVazio
              classe={styles.historicoVazio}
              titulo="Nenhuma despesa registrada"
              descricao="As atividades mais recentes do grupo aparecerão aqui."
            />
          )}
          </div>
        </section>
      </aside>
    </div>
  );
}
