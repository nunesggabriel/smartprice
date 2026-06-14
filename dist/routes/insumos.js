"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// GET /insumos
router.get('/', async (req, res) => {
    try {
        const insumos = await prisma_1.default.insumo.findMany();
        res.json(insumos);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar insumos' });
    }
});
// GET /insumos/:id
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const insumo = await prisma_1.default.insumo.findUnique({ where: { id } });
        if (!insumo)
            return res.status(404).send({ message: 'Insumo não encontrado' });
        res.status(200).send(insumo);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar insumo' });
    }
});
// POST /insumos
router.post('/', async (req, res) => {
    const { nome, custo_unitario } = req.body;
    const usuario_id = req.usuario.id;
    try {
        const existe = await prisma_1.default.insumo.findFirst({
            where: { nome: { equals: nome, mode: 'insensitive' } },
        });
        if (existe)
            return res.status(409).send({ message: 'Já existe um insumo com esse nome' });
        const insumo = await prisma_1.default.insumo.create({
            data: { nome, custo_unitario, usuario_id },
        });
        return res.status(201).send(insumo);
    }
    catch (error) {
        console.error('ERRO:', error);
        return res.status(500).send({ message: 'Erro ao criar insumo' });
    }
});
// PUT /insumos/:id
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.insumo.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Insumo não encontrado' });
        const insumo = await prisma_1.default.insumo.update({ where: { id }, data: { ...req.body } });
        res.status(200).send(insumo);
    }
    catch {
        res.status(500).send({ message: 'Erro ao atualizar insumo' });
    }
});
// DELETE /insumos/:id
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.insumo.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Insumo não encontrado' });
        await prisma_1.default.insumo.delete({ where: { id } });
        res.status(200).send();
    }
    catch {
        res.status(500).send({ message: 'Erro ao excluir insumo' });
    }
});
exports.default = router;
//# sourceMappingURL=insumos.js.map