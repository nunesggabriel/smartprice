import express from 'express';
import { PrismaClient } from '@prisma/client';

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




app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});