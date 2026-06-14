"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'troque-por-uma-chave-secreta';
const auth = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.usuario = decoded; // disponibiliza os dados do usuário para as rotas
        return next();
    }
    catch {
        return res.status(401).send({ message: 'Token inválido ou expirado' });
    }
};
exports.default = auth;
//# sourceMappingURL=auth.js.map