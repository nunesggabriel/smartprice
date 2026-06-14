import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    usuario?: {
        id: number;
        email: string;
    };
}
declare const auth: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export default auth;
//# sourceMappingURL=auth.d.ts.map