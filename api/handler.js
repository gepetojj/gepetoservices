import { Router } from 'express';
const router = Router();

import translator from './translator';
import storage from './storage';
import status from './status';
import users from './users';
import docs from './docs';
import ifal from './ifal';

router.use("/translator", translator);
router.use("/storage", storage);
router.use("/status", status);
router.use("/users", users);
router.use("/docs", docs);
router.use("/ifal", ifal);

export default router;
