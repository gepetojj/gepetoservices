import { Router } from "express";
const router = Router();
import swaggerUI from "swagger-ui-express";
import swagger from "./swagger.json";

const specs = swagger;
swagger.info.version = "2.2.6";

router.use("/", swaggerUI.serve, swaggerUI.setup(specs));

export default router;
