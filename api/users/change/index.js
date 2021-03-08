import { Router } from 'express';
const router = Router();

import avatar from './avatar';
import password from './password';

router.use("/avatar", avatar);
router.use("/password", password);

export default router;
