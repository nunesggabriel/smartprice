"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./middleware/auth"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const produtos_1 = __importDefault(require("./routes/produtos"));
const insumos_1 = __importDefault(require("./routes/insumos"));
const contasPagar_1 = __importDefault(require("./routes/contasPagar"));
const impostos_1 = __importDefault(require("./routes/impostos"));
const configuracao_1 = __importDefault(require("./routes/configuracao"));
const produtoInsumos_1 = __importDefault(require("./routes/produtoInsumos"));
const simulacao_1 = __importDefault(require("./routes/simulacao"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas públicas (não exigem token)
app.use('/usuarios', usuarios_1.default);
// Rotas protegidas (exigem token JWT no header)
app.use('/produtos', auth_1.default, produtos_1.default);
app.use('/insumos', auth_1.default, insumos_1.default);
app.use('/contaspagar', auth_1.default, contasPagar_1.default);
app.use('/impostos', auth_1.default, impostos_1.default);
app.use('/configuracaoprecificacao', auth_1.default, configuracao_1.default);
app.use('/produto-insumos', auth_1.default, produtoInsumos_1.default);
app.use('/simulacao', auth_1.default, simulacao_1.default);
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
//# sourceMappingURL=server.js.map