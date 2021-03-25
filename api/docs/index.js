import { Router } from "express";
const router = Router();
import swaggerUI from "swagger-ui-express";
import swagger from "./swagger.json";

swagger.info.version = "2.3.1";

router.use("/", swaggerUI.serve, swaggerUI.setup(swagger));

export default router;
