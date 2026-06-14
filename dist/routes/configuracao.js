"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// GET /configuracaoprecificacao
router.get('/', async (req, res) => {
    try {
        const configuracoes = await prisma_1.default.configuracaoPrecificacao.findMany();
        res.json(configuracoes);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar configurações de precificação' });
    }
});
// GET /configuracaoprecificacao/:id
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const configuracao = await prisma_1.default.configuracaoPrecificacao.findUnique({ where: { id } });
        if (!configuracao)
            return res.status(404).send({ message: 'Configuração não encontrada' });
        res.status(200).send(configuracao);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar configuração' });
    }
});
// POST /configuracaoprecificacao
router.post('/', async (req, res) => {
    const { lucro_percentual } = req.body;
    const usuario_id = req.usuario.id;
    // ...
    await prisma_1.default.configuracaoPrecificacao.create({
        data: { lucro_percentual, usuario_id },
    });
});
// PUT /configuracaoprecificacao/:id
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.configuracaoPrecificacao.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Configuração não encontrada' });
        const configuracao = await prisma_1.default.configuracaoPrecificacao.update({
            where: { id },
            data: { ...req.body },
        });
        res.status(200).send(configuracao);
    }
    catch {
        res.status(500).send({ message: 'Erro ao atualizar configuração de precificação' });
    }
});
// DELETE /configuracaoprecificacao/:id
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.configuracaoPrecificacao.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Configuração não encontrada' });
        await prisma_1.default.configuracaoPrecificacao.delete({ where: { id } });
        res.status(200).send();
    }
    catch {
        res.status(500).send({ message: 'Erro ao excluir configuração de precificação' });
    }
});
exports.default = router;
//# sourceMappingURL=configuracao.js.map