import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /simulacao
// Lista todas as simulações já realizadas
router.get('/', async (req, res) => {
  try {
    const simulacoes = await prisma.simulacao.findMany({
      orderBy: { criado_em: 'desc' },
      include: {
        produto: { select: { id: true, referencia: true, descricao: true } },
      },
    });
    res.json(simulacoes);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar simulações' });
  }
});

// GET /simulacao/produto/:produto_id
// Histórico de simulações de um produto específico
router.get('/produto/:produto_id', async (req, res) => {
  const produto_id = Number(req.params.produto_id);
  try {
    const simulacoes = await prisma.simulacao.findMany({
      where: { produto_id },
      orderBy: { criado_em: 'desc' },
    });

    if (!simulacoes.length) {
      return res.status(404).send({ message: 'Nenhuma simulação encontrada para este produto' });
    }

    res.json(simulacoes);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar histórico de simulações' });
  }
});

// GET /simulacao/:id
// Detalhe de uma simulação específica
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const simulacao = await prisma.simulacao.findUnique({
      where: { id },
      include: {
        produto: { select: { id: true, referencia: true, descricao: true } },
      },
    });
    if (!simulacao) return res.status(404).send({ message: 'Simulação não encontrada' });
    res.status(200).send(simulacao);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar simulação' });
  }
});

// POST /simulacao/:produto_id
// Calcula e salva o preço de venda de um produto
router.post('/:produto_id', async (req, res) => {
  const produto_id = Number(req.params.produto_id);
  const { markup } = req.body;

  try {
    // 1. Busca o produto com todos os insumos vinculados
    const produto = await prisma.produto.findUnique({
      where: { id: produto_id },
      include: {
        produto_insumos: {
          include: { insumo: true },
        },
      },
    });

    if (!produto) {
      return res.status(404).send({ message: 'Produto não encontrado' });
    }

    if (!produto.produto_insumos.length) {
      return res.status(400).send({
        message: 'Produto não possui insumos vinculados. Vincule a matéria prima antes de simular.',
      });
    }

    if (!produto.producao_mensal || produto.producao_mensal <= 0) {
      return res.status(400).send({
        message: 'Informe a produção mensal do produto antes de simular.',
      });
    }

    // 2. Calcula custo total de matéria prima
    const custoMP = produto.produto_insumos.reduce((soma, pi) => {
      return soma + Number(pi.insumo!.custo_unitario) * Number(pi.quantidade);
    }, 0);

    // 3. Busca despesas do mês atual e calcula rateio
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const despesas = await prisma.contasPagar.findMany({
      where: {
        data_vencimento: { gte: inicioMes, lte: fimMes },
      },
    });

    const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0);

    // Soma a produção mensal de todos os produtos cadastrados
    const todosProdutos = await prisma.produto.findMany({
      select: { producao_mensal: true },
    });
    const totalProducao = todosProdutos.reduce(
      (s, p) => s + (p.producao_mensal ?? 0), 0
    );

    // Rateio por unidade produzida
    const custoRateado = totalProducao > 0 ? totalDespesas / totalProducao : 0;

    // 4. Busca todos os impostos e soma os percentuais
    const impostos = await prisma.imposto.findMany();
    const percentualImpostos = impostos.reduce(
      (s, i) => s + Number(i.percentual ?? 0), 0
    );

    // 5. Monta o custo base e aplica impostos
    const custoBase = custoMP + custoRateado;
    const custoComImposto = custoBase * (1 + percentualImpostos / 100);

    // 6. Aplica o markup para chegar no preço de venda
    const markupUsado = Number(markup) || 2.5;
    const precoVenda = custoComImposto * markupUsado;

    // 7. Salva a simulação no banco
    const simulacao = await prisma.simulacao.create({
      data: {
        produto_id,
        preco_calculado: precoVenda,
        margem_usada: markupUsado,
      },
    });

    // 8. Retorna o detalhamento completo para o frontend exibir
    return res.status(201).json({
      simulacao_id: simulacao.id,
      produto: {
        id: produto.id,
        referencia: produto.referencia,
        descricao: produto.descricao,
        producao_mensal: produto.producao_mensal,
      },
      detalhamento: {
        custo_materia_prima: custoMP.toFixed(2),
        custo_rateado_despesas: custoRateado.toFixed(2),
        custo_base: custoBase.toFixed(2),
        percentual_impostos: percentualImpostos.toFixed(2) + '%',
        custo_com_imposto: custoComImposto.toFixed(2),
        markup_aplicado: markupUsado,
      },
      preco_venda_sugerido: precoVenda.toFixed(2),
      criado_em: simulacao.criado_em,
    });
  } catch (error) {
    console.error('Erro na simulação:', error);
    res.status(500).send({ message: 'Erro ao calcular precificação' });
  }
});

// DELETE /simulacao/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.simulacao.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Simulação não encontrada' });

    await prisma.simulacao.delete({ where: { id } });
    res.status(200).send();
  } catch {
    res.status(500).send({ message: 'Erro ao excluir simulação' });
  }
});

export default router;