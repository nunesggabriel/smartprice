import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'troque-por-uma-chave-secreta';

// Extende o tipo Request do Express para carregar os dados do usuário logado
export interface AuthRequest extends Request {
  usuario?: {
    id: number;
    email: string;
  };
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'Token não informado' });
  }

  // O header chega no formato "Bearer eyJhbGci..."
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).send({ message: 'Token mal formatado' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.usuario = decoded; // disponibiliza os dados do usuário para as rotas
    return next();
  } catch {
    return res.status(401).send({ message: 'Token inválido ou expirado' });
  }
};

export default auth;