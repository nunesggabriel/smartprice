"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// GET /produto-insumos
router.get('/', async (req, res) => {
    try {
        const vinculos = await prisma_1.default.produtoInsumo.findMany({
            include: {
                produto: { select: { id: true, referencia: true } },
                insumo: { select: { id: true, nome: true, custo_unitario: true } },
            },
        });
        res.json(vinculos);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar vínculos' });
    }
});
// GET /produto-insumos/produto/:produto_id
// Lista todos os insumos de um produto específico com custo calculado
router.get('/produto/:produto_id', async (req, res) => {
    const produto_id = Number(req.params.produto_id);
    try {
        const vinculos = await prisma_1.default.produtoInsumo.findMany({
            where: { produto_id },
            include: {
                insumo: { select: { id: true, nome: true, custo_unitario: true } },
            },
        });
        if (!vinculos.length) {
            return res.status(404).send({ message: 'Nenhum insumo vinculado a este produto' });
        }
        // Retorna cada vínculo já com o custo total da linha (custo_unitario × quantidade)
        const resultado = vinculos.map((v) => ({
            id: v.id,
            insumo_id: v.insumo_id,
            nome: v.insumo?.nome,
            custo_unitario: Number(v.insumo?.custo_unitario),
            quantidade: Number(v.quantidade),
            custo_total_linha: Number(v.insumo?.custo_unitario) * Number(v.quantidade),
        }));
        const custoTotalMP = resultado.reduce((s, r) => s + r.custo_total_linha, 0);
        res.json({
            produto_id,
            insumos: resultado,
            custo_total_materia_prima: custoTotalMP.toFixed(2),
        });
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar insumos do produto' });
    }
});
// POST /produto-insumos
router.post('/', async (req, res) => {
    const { produto_id, insumo_id, quantidade } = req.body;
    try {
        // Verifica se produto existe
        const produto = await prisma_1.default.produto.findUnique({ where: { id: produto_id } });
        if (!produto)
            return res.status(404).send({ message: 'Produto não encontrado' });
        // Verifica se insumo existe
        const insumo = await prisma_1.default.insumo.findUnique({ where: { id: insumo_id } });
        if (!insumo)
            return res.status(404).send({ message: 'Insumo não encontrado' });
        // Verifica se esse insumo já está vinculado a esse produto
        const existe = await prisma_1.default.produtoInsumo.findFirst({
            where: { produto_id, insumo_id },
        });
        if (existe) {
            return res.status(409).send({
                message: 'Insumo já vinculado a este produto. Use o PUT para atualizar a quantidade.',
            });
        }
        const vinculo = await prisma_1.default.produtoInsumo.create({
            data: { produto_id, insumo_id, quantidade },
            include: {
                insumo: { select: { nome: true, custo_unitario: true } },
            },
        });
        return res.status(201).send(vinculo);
    }
    catch {
        res.status(500).send({ message: 'Erro ao vincular insumo ao produto' });
    }
});
// PUT /produto-insumos/:id
// Atualiza a quantidade de um insumo já vinculado
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { quantidade } = req.body;
    try {
        const existe = await prisma_1.default.produtoInsumo.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Vínculo não encontrado' });
        const vinculo = await prisma_1.default.produtoInsumo.update({
            where: { id },
            data: { quantidade },
            include: {
                insumo: { select: { nome: true, custo_unitario: true } },
            },
        });
        res.status(200).send(vinculo);
    }
    catch {
        res.status(500).send({ message: 'Erro ao atualizar vínculo' });
    }
});
// DELETE /produto-insumos/:id
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.produtoInsumo.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Vínculo não encontrado' });
        await prisma_1.default.produtoInsumo.delete({ where: { id } });
        res.status(200).send();
    }
    catch {
        res.status(500).send({ message: 'Erro ao remover vínculo' });
    }
});
exports.default = router;
//# sourceMappingURL=produtoInsumos.js.map