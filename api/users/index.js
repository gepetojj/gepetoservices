import { Router } from 'express';
const router = Router();

import register from './register';
import confirm from './confirm';
import login from './login';
import verify from './verify';
import refresh from './refresh';
import change from './change';
import tfa from './tfa';

router.use("/register", register);
router.use("/confirm", confirm);
router.use("/login", login);
router.use("/verify", verify);
router.use("/refresh", refresh);

router.use("/change", change);
router.use("/tfa", tfa);

export default router;
