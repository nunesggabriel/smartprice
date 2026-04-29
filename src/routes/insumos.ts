import { Router } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth'; 

const router = Router();

// GET /insumos
router.get('/', async (req, res) => {
  try {
    const insumos = await prisma.insumo.findMany();
    res.json(insumos);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar insumos' });
  }
});

// GET /insumos/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const insumo = await prisma.insumo.findUnique({ where: { id } });
    if (!insumo) return res.status(404).send({ message: 'Insumo não encontrado' });
    res.status(200).send(insumo);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar insumo' });
  }
});

// POST /insumos
router.post('/', async (req: AuthRequest, res) => {
  const { nome, custo_unitario } = req.body;
  const usuario_id = req.usuario!.id;

  try {
    const existe = await prisma.insumo.findFirst({
      where: { nome: { equals: nome, mode: 'insensitive' } },
    });

    if (existe) return res.status(409).send({ message: 'Já existe um insumo com esse nome' });

    const insumo = await prisma.insumo.create({
      data: { nome, custo_unitario, usuario_id },
    });

    return res.status(201).send(insumo);
  } catch (error) {
    console.error('ERRO:', error);
    return res.status(500).send({ message: 'Erro ao criar insumo' });
  }
});


// PUT /insumos/:id
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.insumo.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Insumo não encontrado' });

    const insumo = await prisma.insumo.update({ where: { id }, data: { ...req.body } });
    res.status(200).send(insumo);
  } catch {
    res.status(500).send({ message: 'Erro ao atualizar insumo' });
  }
});

// DELETE /insumos/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.insumo.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Insumo não encontrado' });

    await prisma.insumo.delete({ where: { id } });
    res.status(200).send();
  } catch {
    res.status(500).send({ message: 'Erro ao excluir insumo' });
  }
});

export default router;