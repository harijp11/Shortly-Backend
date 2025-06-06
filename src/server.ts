import express from 'express';
import { connectDB } from './config/dbconfig';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth_route';
import userRoutes from './routes/user_route';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const Allowed_orgins = (process.env.ALLOWED_ORIGIN || "").split(",").map((ORIGIN)=>ORIGIN.trim()).filter(Boolean)
app.use(cors({
  origin:function (origin, callback){
  if(!origin || Allowed_orgins.includes(origin)){
      callback(null,true)
  }else{
    callback(new Error('Not allowed by CORS'))
  }   
},
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
connectDB();

app.use(express.json());
app.use(cookieParser());



app.use('/api/auth', authRoutes);
app.use('/api/user',userRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
