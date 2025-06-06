// routes/authRoutes.ts
import express, { Request, Response } from 'express';
import {register,login} from "../controller/auth_controller"
import { logoutIfRefreshTokenInvalid, refreshToken } from '../middlewares/verifyAuth';

const router = express.Router();

router.post('/register',(req:Request,res:Response)=>{
  register(req,res)
});
router.post('/login',(req:Request,res:Response)=>{
  login(req,res)
});

router.get('/refresh-token', (req:Request,res:Response)=>{
  refreshToken(req,res)
});

router.get('/logout', ()=>{
 logoutIfRefreshTokenInvalid
});

export default router;
