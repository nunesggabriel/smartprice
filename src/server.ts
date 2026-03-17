import express from 'express';

const port = 3000;
const app = express();


app.get('/usuarios', (req, res) => {
  res.send('Lista de usuários');
});

app.listen(port, () => {
  console.log(`Servido em execução na porta ${port}`);
});