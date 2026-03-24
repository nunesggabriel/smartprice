import express from 'express';
import { PrismaClient } from '@prisma/client';
import console = require('node:console');
import log = require('node:console');

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());


app.get('/usuarios', async (req, res) => {
  const usuarios = await prisma.usuario.findMany();
  res.json(usuarios);
});

app.post('/usuarios', async (req, res) => { 

  const { nome, email, senha } = req.body;

  try {

    const emailExistente = await prisma.usuario.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (emailExistente) {
      return res.status(409).send({ message: 'Já existe um usuário com esse email' });
    }

  await prisma.usuario.create({
    data: {
      nome,
      email,
      senha,
    },
  });
}catch (error) {
  res.status(500).send({ message: 'Erro ao criar usuário'});
}
  res.status(201).send({ message: 'Usuário criado com sucesso!' });
});

app.put('/usuarios/:id', async (req, res) => {
  
  const id = Number(req.params.id);

  try {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { id },
  });

  if (!usuarioExistente) {
    return res.status(404).send({ message: 'Usuário não encontrado' });
  }

  const data = {...req.body};

  const usuario = await prisma.usuario.update({
    where: { id },
    data: data,
  });
}catch (error) {return res.status(500).send({ message: 'Erro ao atualizar usuário' });
      }
    res.status(200).send();
});

app.delete('/usuarios/:id', async (req, res) => { 

  const id = Number(req.params.id);

  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return res.status(404).send({ message: 'Usuário não encontrado' });
    }

    await prisma.usuario.delete({
      where: { id },
    });
  } catch (error) {
    return res.status(500).send({ message: 'Erro ao excluir usuário' });
  }
  res.status(200).send();
});

app.get('/usuarios/:id', async (req, res) => {
  const id = Number(req.params.id);

  try{
  const usuario = await prisma.usuario.findUnique({
    where: { id },
  });
  if (!usuario) {
    return res.status(404).send({ message: 'Usuário não encontrado' });
  }
   res.status(200).send(usuario);
}catch (error) {  return res.status(500).send({ message: 'Erro ao buscar usuário' });
}
});

app.post('/usuarios/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email, senha },
    });

    if (!usuario) {
      return res.status(401).send({ message: 'Email ou senha inválidos' });
    }

    res.status(200).send({ message: 'Login realizado com sucesso'});
  } catch (error) {
    res.status(500).send({ message: 'Erro ao realizar login' });
  }
});

// ------------- PRODUTOS -------------------

app.post('/produtos', async (req, res) => {
  const { referencia, descricao, custo_base, producao_mensal } = req.body;

  try {
    const referenciaExistente = await prisma.produto.findFirst({
      where: { referencia: { equals: referencia, mode: 'insensitive' } },
    });

    if (referenciaExistente) {
      return res.status(409).send({ message: 'Já existe um produto com essa referência' });
    }

    await prisma.produto.create({
      data: {
        referencia,
        descricao,
        custo_base,
        producao_mensal,
      },
    });

    return res.status(201).send({ message: 'Produto criado com sucesso!' });

  } catch (error) {
    console.error("Erro na rota /produtos:", error);
    return res.status(500).send({ message: 'Erro ao criar produto' });
  }
});

app.get('/produtos', async (req, res) => {
  const produtos = await prisma.produto.findMany();
  res.json(produtos);
});

app.get('/produtos/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const produto = await prisma.produto.findUnique({
      where: { id },
    });
    if (!produto) {
      return res.status(404).send({ message: 'Produto não encontrado' });
    }
    res.status(200).send(produto);
  } catch (error) {
    console.error("Erro na rota GET /produtos/:id:", error);
    return res.status(500).send({ message: 'Erro ao buscar produto' });
  }
});

app.put('/produtos/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const produtoExistente = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      return res.status(404).send({ message: 'Produto não encontrado' });
    }

    const data = {...req.body};

    const produto = await prisma.produto.update({
      where: { id },
      data: data,
    });
    res.status(200).send(produto);
  } catch (error) {
    console.error("Erro na rota PUT /produtos/:id:", error);
    return res.status(500).send({ message: 'Erro ao atualizar produto' });
  }
});

app.delete('/produtos/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const produtoExistente = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      return res.status(404).send({ message: 'Produto não encontrado' });
    }

    await prisma.produto.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Erro na rota DELETE /produtos/:id:", error);
    return res.status(500).send({ message: 'Erro ao excluir produto' });
  }
  res.status(200).send();
});

// ------------- CUSTOS PRODUTOS -------------------




app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});