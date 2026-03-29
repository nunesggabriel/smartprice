import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'troque-por-uma-chave-secreta';

// GET /usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, criado_em: true }, // nunca retorna a senha
    });
    res.json(usuarios);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar usuários' });
  }
});

// GET /usuarios/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, criado_em: true },
    });
    if (!usuario) return res.status(404).send({ message: 'Usuário não encontrado' });
    res.status(200).send(usuario);
  } catch {
    res.status(500).send({ message: 'Erro ao buscar usuário' });
  }
});

// POST /usuarios  (cadastro)
router.post('/', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const emailExistente = await prisma.usuario.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (emailExistente) {
      return res.status(409).send({ message: 'Já existe um usuário com esse email' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await prisma.usuario.create({
      data: { nome, email, senha: senhaHash },
    });

    return res.status(201).send({ message: 'Usuário criado com sucesso!' });
  } catch {
    res.status(500).send({ message: 'Erro ao criar usuário' });
  }
});

// POST /usuarios/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findFirst({ where: { email } });
    if (!usuario) {
      return res.status(401).send({ message: 'Email ou senha inválidos' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).send({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).send({ token, nome: usuario.nome });
  } catch {
    res.status(500).send({ message: 'Erro ao realizar login' });
  }
});

// PUT /usuarios/:id
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.usuario.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Usuário não encontrado' });

    // Se estiver atualizando a senha, criptografa antes de salvar
    const data = { ...req.body };
    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 10);
    }

    const usuario = await prisma.usuario.update({ where: { id }, data });
    const { senha: _, ...usuarioSemSenha } = usuario; // remove a senha do retorno
    res.status(200).send(usuarioSemSenha);
  } catch {
    res.status(500).send({ message: 'Erro ao atualizar usuário' });
  }
});

// DELETE /usuarios/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const existe = await prisma.usuario.findUnique({ where: { id } });
    if (!existe) return res.status(404).send({ message: 'Usuário não encontrado' });

    await prisma.usuario.delete({ where: { id } });
    res.status(200).send();
  } catch {
    res.status(500).send({ message: 'Erro ao excluir usuário' });
  }
});

export default router;
