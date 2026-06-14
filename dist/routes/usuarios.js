"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'troque-por-uma-chave-secreta';
// GET /usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await prisma_1.default.usuario.findMany({
            select: { id: true, nome: true, email: true, criado_em: true }, // nunca retorna a senha
        });
        res.json(usuarios);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar usuários' });
    }
});
// GET /usuarios/:id
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const usuario = await prisma_1.default.usuario.findUnique({
            where: { id },
            select: { id: true, nome: true, email: true, criado_em: true },
        });
        if (!usuario)
            return res.status(404).send({ message: 'Usuário não encontrado' });
        res.status(200).send(usuario);
    }
    catch {
        res.status(500).send({ message: 'Erro ao buscar usuário' });
    }
});
// POST /usuarios  (cadastro)
router.post('/', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const emailExistente = await prisma_1.default.usuario.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
        });
        if (emailExistente) {
            return res.status(409).send({ message: 'Já existe um usuário com esse email' });
        }
        const senhaHash = await bcrypt_1.default.hash(senha, 10);
        await prisma_1.default.usuario.create({
            data: { nome, email, senha: senhaHash },
        });
        return res.status(201).send({ message: 'Usuário criado com sucesso!' });
    }
    catch {
        res.status(500).send({ message: 'Erro ao criar usuário' });
    }
});
// POST /usuarios/login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await prisma_1.default.usuario.findFirst({ where: { email } });
        if (!usuario) {
            return res.status(401).send({ message: 'Email ou senha inválidos' });
        }
        const senhaCorreta = await bcrypt_1.default.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).send({ message: 'Email ou senha inválidos' });
        }
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).send({ token, nome: usuario.nome });
    }
    catch {
        res.status(500).send({ message: 'Erro ao realizar login' });
    }
});
// PUT /usuarios/:id
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.usuario.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Usuário não encontrado' });
        // Se estiver atualizando a senha, criptografa antes de salvar
        const data = { ...req.body };
        if (data.senha) {
            data.senha = await bcrypt_1.default.hash(data.senha, 10);
        }
        const usuario = await prisma_1.default.usuario.update({ where: { id }, data });
        const { senha: _, ...usuarioSemSenha } = usuario; // remove a senha do retorno
        res.status(200).send(usuarioSemSenha);
    }
    catch {
        res.status(500).send({ message: 'Erro ao atualizar usuário' });
    }
});
// DELETE /usuarios/:id
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existe = await prisma_1.default.usuario.findUnique({ where: { id } });
        if (!existe)
            return res.status(404).send({ message: 'Usuário não encontrado' });
        await prisma_1.default.usuario.delete({ where: { id } });
        res.status(200).send();
    }
    catch {
        res.status(500).send({ message: 'Erro ao excluir usuário' });
    }
});
exports.default = router;
//# sourceMappingURL=usuarios.js.map