import { Router } from "express";
const router = Router();
import swaggerUI from "swagger-ui-express";
import { version } from "../../package.json";
import swagger from "./swagger.json";

const specs = swagger;
swagger.info.version = version;

router.use("/", swaggerUI.serve, swaggerUI.setup(specs));

export default router;
