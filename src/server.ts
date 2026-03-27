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

app.post('/insumos', async (req, res) => {
    const { nome, custo_unitario } = req.body;

    try{
      const materialExistente = await prisma.insumo.findFirst({
        where: { nome: { equals: nome, mode: 'insensitive' } },
      });

      if (materialExistente) {
        return res.status(409).send({ message: 'Já existe um insumo com esse nome' });
      }

      await prisma.insumo.create({
        data: {
          nome,
          custo_unitario,
        },
      });

      return res.status(201).send({ message: 'Insumo criado com sucesso!' });
    } catch (error) {
      console.error("Erro na rota /insumos:", error);
      return res.status(500).send({ message: 'Erro ao criar insumo' });
    }
  });
  
  app.get('/insumos', async (req, res) => {
  const insumos = await prisma.insumo.findMany();
  res.json(insumos);
});

app.get('/insumos/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const insumo = await prisma.insumo.findUnique({
      where: { id },
    });
    if (!insumo) {
      return res.status(404).send({ message: 'Insumo não encontrado' });
    }
    res.status(200).send(insumo);
  } catch (error) {
    console.error("Erro na rota GET /insumos/:id:", error);
    return res.status(500).send({ message: 'Erro ao buscar insumo' });
  }
});


app.put('/insumos/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const insumoExistente = await prisma.insumo.findUnique({
      where: { id },
    });

    if (!insumoExistente) {
      return res.status(404).send({ message: 'Insumo não encontrado' });
    }

    const data = {...req.body};

    const insumo = await prisma.insumo.update({
      where: { id },
      data: data,
    });
    res.status(200).send(insumo);
  } catch (error) {
    console.error("Erro na rota PUT /insumos/:id:", error);
    return res.status(500).send({ message: 'Erro ao atualizar insumo' });
  }
});


app.delete('/insumos/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const insumoExistente = await prisma.insumo.findUnique({
      where: { id },
    });

    if (!insumoExistente) {
      return res.status(404).send({ message: 'Insumo não encontrado' });
    }

    await prisma.insumo.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Erro na rota DELETE /insumos/:id:", error);
    return res.status(500).send({ message: 'Erro ao excluir insumo' });
  }
  res.status(200).send();
});

// ------------- DESPESAS -------------

app.post('/contaspagar', async (req, res) => {
    const { descricao, valor, data_vencimento, data_pagamento, status } = req.body;

    try{
        await prisma.contasPagar.create({
        data: {
          descricao,
          valor,
          data_vencimento,
          data_pagamento,
          status
        },
      });

      return res.status(201).send({ message: 'Contas a pagar criada com sucesso!' });
    } catch (error) {
      console.error("Erro na rota /contaspagar:", error);
      return res.status(500).send({ message: 'Erro ao criar contas a pagar' });
    }
  });

  app.get('/contaspagar', async (req, res) => {
    const contasPagar = await prisma.contasPagar.findMany();
    res.json(contasPagar);
  });

  app.get('/contaspagar/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      const contaPagar = await prisma.contasPagar.findUnique({
        where: { id },
      });
      if (!contaPagar) {
        return res.status(404).send({ message: 'Conta a pagar não encontrada' });
      }
      res.status(200).send(contaPagar);
    } catch (error) {
      console.error("Erro na rota GET /contaspagar/:id:", error);
      return res.status(500).send({ message: 'Erro ao buscar conta a pagar' });
    }
  });

app.put('/contaspagar/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const contaPagarExistente = await prisma.contasPagar.findUnique({
      where: { id },
    });

    if (!contaPagarExistente) {
      return res.status(404).send({ message: 'Conta a pagar não encontrada' });
    }

    const data = {...req.body};

    const contaPagar = await prisma.contasPagar.update({
      where: { id },
      data: data,
    });
    res.status(200).send(contaPagar);
  } catch (error) {
    console.error("Erro na rota PUT /contaspagar/:id:", error);
    return res.status(500).send({ message: 'Erro ao atualizar conta a pagar' });
  }
});


app.delete('/contaspagar/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const contaPagarExistente = await prisma.contasPagar.findUnique({
      where: { id },
    });

    if (!contaPagarExistente) {
      return res.status(404).send({ message: 'Conta a pagar não encontrada' });
    }

    await prisma.contasPagar.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Erro na rota DELETE /contaspagar/:id:", error);
    return res.status(500).send({ message: 'Erro ao excluir conta a pagar' });
  }
  res.status(200).send();
});

// ------------- IMPOSTOS -------------

app.post('/impostos', async (req, res) => {
    const { nome, percentual } = req.body;

    
    try{
        await prisma.imposto.create({
        data: {
          nome,
          percentual
        },
      });
            return res.status(201).send({ message: 'Imposto criado com sucesso!' });
    } catch (error) {
      console.error("Erro na rota /impostos:", error);
      return res.status(500).send({ message: 'Erro ao criar imposto' });
    }
  });

  
app.put('/impostos/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const impostoExistente = await prisma.imposto.findUnique({
      where: { id },
    });

    if (!impostoExistente) {
      return res.status(404).send({ message: 'Imposto não encontrado' });
    }

    const data = {...req.body};

    const imposto = await prisma.imposto.update({
      where: { id },
      data: data,
    });
    res.status(200).send(imposto);
  } catch (error) {
    console.error("Erro na rota PUT /impostos/:id:", error);
    return res.status(500).send({ message: 'Erro ao atualizar imposto' });
  }
});

  app.get('/impostos', async (req, res) => {
    const impostos = await prisma.imposto.findMany();
    res.json(impostos);
  });

    app.get('/impostos', async (req, res) => {
    const impostos = await prisma.imposto.findMany();
    res.json(impostos);
  });


  app.get('/impostos/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      const imposto = await prisma.imposto.findUnique({
        where: { id },
      });
      if (!imposto) {
        return res.status(404).send({ message: 'Imposto não encontrado' });
      }
      res.status(200).send(imposto);
    } catch (error) {
      console.error("Erro na rota GET /impostos/:id:", error);
      return res.status(500).send({ message: 'Erro ao buscar imposto' });
    }
  });


  app.delete('/impostos/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const impostoExistente = await prisma.imposto.findUnique({
      where: { id },
    });

    if (!impostoExistente) {
      return res.status(404).send({ message: 'Imposto não encontrado' });
    }

    await prisma.imposto.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Erro na rota DELETE /impostos/:id:", error);
    return res.status(500).send({ message: 'Erro ao excluir imposto' });
  }
  res.status(200).send();
});
  

// ------------- CONFIGURAÇÃO DE MARKUP -------------


app.post('/configuracaoprecificacao', async (req, res) => {
    const { lucro_percentual } = req.body;

    
    try{
        await prisma.configuracaoPrecificacao.create({
        data: {
          lucro_percentual
        },
      });
            return res.status(201).send({ message: 'Configuração de precificação criada com sucesso!' });
    } catch (error) {
      console.error("Erro na rota /configuracaoprecificacao:", error);
      return res.status(500).send({ message: 'Erro ao criar configuração de precificação' });
    }
  });

  
app.put('/configuracaoprecificacao/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const configuracaoExistente = await prisma.configuracaoPrecificacao.findUnique({
      where: { id },
    });

    if (!configuracaoExistente) {
      return res.status(404).send({ message: 'Configuração de precificação não encontrada' });
    }

    const data = {...req.body};

    const configuracao = await prisma.configuracaoPrecificacao.update({
      where: { id },
      data: data,
    });
    res.status(200).send(configuracao);
  } catch (error) {
    console.error("Erro na rota PUT /configuracaoprecificacao/:id:", error);
    return res.status(500).send({ message: 'Erro ao atualizar configuração de precificação' });
  }
});

  app.get('/configuracaoprecificacao', async (req, res) => {
    const configuracoes = await prisma.configuracaoPrecificacao.findMany();
    res.json(configuracoes);
  });

    app.delete('/configuracaoprecificacao/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const configuracaoExistente = await prisma.configuracaoPrecificacao.findUnique({
      where: { id },
    });

    if (!configuracaoExistente) {
      return res.status(404).send({ message: 'Configuração de precificação não encontrada' });
    }

    await prisma.configuracaoPrecificacao.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Erro na rota DELETE /configuracaoprecificacao/:id:", error);
    return res.status(500).send({ message: 'Erro ao excluir configuração de precificação' });
  }
  res.status(200).send();
});



app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});