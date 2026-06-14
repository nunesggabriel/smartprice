"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// GET /contaspagar
router.get('/', async (req, res) => {
    try {
        const contas = await prisma_1.default.contasPagar.findMany({
            orderBy: { data_vencimento: 'asc' },
        });
        res.json(contas);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar contas a pagar' });
    }
});
// GET /contaspagar/:id
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const conta = await prisma_1.default.contasPagar.findUnique({ where: { id } });
        if (!conta)
            return res.status(404).send({ message: 'Conta a pagar não encontrada' });
        res.status(200).send(conta);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar conta a pagar' });
    }
});
// POST /contaspagar
router.post('/', async (req, res) => {
    const { descricao, valor, valor_pago, data_vencimento, data_pagamento, status } = req.body;
    const usuario_id = req.usuario.id;
    try {
        const conta = await prisma_1.default.contasPagar.create({
            data: {
                descricao,
                valor,
                valor_pago: valor_pago ?? null,
                data_vencimento: data_vencimento ? new Date(data_vencimento + 'T00:00:00') : null,
                data_pagamento: data_pagamento ? new Date(data_pagamento + 'T00:00:00') : null,
                status: status ?? 'pendente',
                usuario_id,
            },
        });
        return res.status(201).send(conta);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Erro ao criar conta a pagar' });
    }
});
// PUT /contaspagar/:id
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.contasPagar.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Conta a pagar não encontrada' });
        const data = { ...req.body };
        if (data.data_vencimento)
            data.data_vencimento = new Date(data.data_vencimento + 'T00:00:00');
        if (data.data_pagamento)
            data.data_pagamento = new Date(data.data_pagamento + 'T00:00:00');
        const conta = await prisma_1.default.contasPagar.update({ where: { id }, data });
        res.status(200).send(conta);
    }
    catch {
        res.status(500).send({ message: 'Erro ao atualizar conta a pagar' });
    }
});
// DELETE /contaspagar/:id
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.contasPagar.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Conta a pagar não encontrada' });
        await prisma_1.default.contasPagar.delete({ where: { id } });
        res.status(200).send();
    }
    catch {
        res.status(500).send({ message: 'Erro ao excluir conta a pagar' });
    }
});
exports.default = router;
//# sourceMappingURL=contasPagar.js.map