import express from 'express';
import { 
  createUrl, 
  redirect, 
  getUrls, 
  // getAnalytics, 
  deleteUrl 
} from '../controller/userUrlController';
import { verifyToken } from '../middlewares/verifyAuth';

const router = express.Router();

router.post('/shorten', verifyToken, createUrl);

router.get('/urls', verifyToken, getUrls);

// router.get('/analytics/:urlId', verifyToken, getAnalytics);


router.delete('/urls/:urlId', verifyToken, deleteUrl);

router.get('/:shortCode', redirect);

export default router;