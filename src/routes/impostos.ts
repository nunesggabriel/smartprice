import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /impostos
router.get('/', async (req, res) => {
  try {
    const impostos = await prisma.imposto.findMany();
    res.json(impostos);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar impostos' });
  }
});

// GET /impostos/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const imposto = await prisma.imposto.findUnique({ where: { id } });
    if (!imposto) return res.status(404).send({ message: 'Imposto não encontrado' });
    res.status(200).send(imposto);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar imposto' });
  }
});

// POST /impostos
router.post('/', async (req, res) => {
  const { nome, percentual } = req.body;
  try {
    const existe = await prisma.imposto.findFirst({
      where: { nome: { equals: nome, mode: 'insensitive' } },
    });
    if (existe) return res.status(409).send({ message: 'Já existe um imposto com esse nome' });

    const imposto = await prisma.imposto.create({
      data: { nome, percentual },
    });
    return res.status(201).send(imposto);
  } catch {
    res.status(500).send({ message: 'Erro ao criar imposto' });
  }
});

// PUT /impostos/:id
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.imposto.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Imposto não encontrado' });

    const imposto = await prisma.imposto.update({ where: { id }, data: { ...req.body } });
    res.status(200).send(imposto);
  } catch {
    res.status(500).send({ message: 'Erro ao atualizar imposto' });
  }
});

// DELETE /impostos/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.imposto.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Imposto não encontrado' });

    await prisma.imposto.delete({ where: { id } });
    res.status(200).send();
  } catch {
    res.status(500).send({ message: 'Erro ao excluir imposto' });
  }
});

export default router;