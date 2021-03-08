import { Router } from 'express';
const router = Router();

import translator from './translator';
import storage from './storage';
import status from './status';
import users from './users';

router.use("/translator", translator);
router.use("/storage", storage);
router.use("/status", status);
router.use("/users", users);

export default router;
