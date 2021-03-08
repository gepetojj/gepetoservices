import { Router } from 'express';
const router = Router();

import access from './access';
import deleteFile from './delete';
import upload from './upload';

router.use("/access", access);
router.use("/delete", deleteFile);
router.use("/upload", upload);

export default router;
