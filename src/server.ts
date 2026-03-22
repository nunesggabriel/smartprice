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

app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});