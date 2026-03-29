import { Router } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth'; // <-- importa o tipo

const router = Router();

router.get('/', async (req, res) => {
  const produtos = await prisma.produto.findMany();
  res.json(produtos);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const produto = await prisma.produto.findUnique({ where: { id } });
    if (!produto) return res.status(404).send({ message: 'Produto não encontrado' });
    res.status(200).send(produto);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar produto' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  const { referencia, descricao, custo_base, producao_mensal } = req.body;
  const usuario_id = req.usuario!.id; // <-- vem do token, não do body

  try {
    const existe = await prisma.produto.findFirst({
      where: { referencia: { equals: referencia, mode: 'insensitive' } },
    });
    if (existe) return res.status(409).send({ message: 'Já existe um produto com essa referência' });

    const produto = await prisma.produto.create({
      data: { referencia, descricao, custo_base, producao_mensal, usuario_id }, // <-- salva o dono
    });
    return res.status(201).send(produto);
  } catch {
    res.status(500).send({ message: 'Erro ao criar produto' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.produto.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Produto não encontrado' });

    const produto = await prisma.produto.update({ where: { id }, data: { ...req.body } });
    res.status(200).send(produto);
  } catch {
    res.status(500).send({ message: 'Erro ao atualizar produto' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.produto.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Produto não encontrado' });

    await prisma.produto.delete({ where: { id } });
    res.status(200).send();
  } catch {
    res.status(500).send({ message: 'Erro ao excluir produto' });
  }
});

export default router;