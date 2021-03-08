import { Router } from 'express';
const router = Router();

import enable from './enable';
import verify from './verify';
import disable from './disable';

router.use("/enable", enable);
router.use("/verify", verify);
router.use("/disable", disable);

export default router;
