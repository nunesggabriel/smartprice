import { Router } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth'; 

const router = Router();

// GET /configuracaoprecificacao
router.get('/', async (req, res) => {
  try {
    const configuracoes = await prisma.configuracaoPrecificacao.findMany();
    res.json(configuracoes);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar configurações de precificação' });
  }
});

// GET /configuracaoprecificacao/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const configuracao = await prisma.configuracaoPrecificacao.findUnique({ where: { id } });
    if (!configuracao) return res.status(404).send({ message: 'Configuração não encontrada' });
    res.status(200).send(configuracao);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar configuração' });
  }
});

// POST /configuracaoprecificacao
router.post('/', async (req: AuthRequest, res) => {
  const { lucro_percentual } = req.body;
  const usuario_id = req.usuario!.id;
  // ...
  await prisma.configuracaoPrecificacao.create({
    data: { lucro_percentual, usuario_id },
  });
});

// PUT /configuracaoprecificacao/:id
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.configuracaoPrecificacao.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Configuração não encontrada' });

    const configuracao = await prisma.configuracaoPrecificacao.update({
      where: { id },
      data: { ...req.body },
    });
    res.status(200).send(configuracao);
  } catch {
    res.status(500).send({ message: 'Erro ao atualizar configuração de precificação' });
  }
});

// DELETE /configuracaoprecificacao/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.configuracaoPrecificacao.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Configuração não encontrada' });

    await prisma.configuracaoPrecificacao.delete({ where: { id } });
    res.status(200).send();
  } catch {
    res.status(500).send({ message: 'Erro ao excluir configuração de precificação' });
  }
});

export default router;