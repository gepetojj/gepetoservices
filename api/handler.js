import { Router } from 'express';
const router = Router();

import translator from './translator';
import storage from './storage';
import status from './status';
import users from './users';
import docs from './docs';

router.use("/translator", translator);
router.use("/storage", storage);
router.use("/status", status);
router.use("/users", users);
router.use("/docs", docs);

export default router;
