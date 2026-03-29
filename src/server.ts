import express from 'express';
import cors from 'cors';

import auth from './middleware/auth';

import usuariosRouter from './routes/usuarios';
import produtosRouter from './routes/produtos';
import insumosRouter from './routes/insumos';
import contasPagarRouter from './routes/contasPagar';
import impostosRouter from './routes/impostos';
import configuracaoRouter from './routes/configuracao';
import produtoInsumosRouter from './routes/produtoInsumos';
import simulacaoRouter from './routes/simulacao';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Rotas públicas (não exigem token)
app.use('/usuarios', usuariosRouter);

// Rotas protegidas (exigem token JWT no header)
app.use('/produtos',                 auth, produtosRouter);
app.use('/insumos',                  auth, insumosRouter);
app.use('/contaspagar',              auth, contasPagarRouter);
app.use('/impostos',                 auth, impostosRouter);
app.use('/configuracaoprecificacao', auth, configuracaoRouter);
app.use('/produto-insumos',          auth, produtoInsumosRouter);
app.use('/simulacao',                auth, simulacaoRouter);

app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});