import { Router } from "express";
const router = Router();
import jwt from "jsonwebtoken";

import response from "../../assets/response";
import firebase from "../../assets/firebase";
import logger from "../../assets/logger";

const ifal = firebase.firestore().collection("ifal");

router.post("/", async (req, res) => {
	const { token } = req.query;
	const decodedToken = jwt.decode(token, { json: true });

	if (decodedToken) {
		try {
			const data = JSON.parse(decodedToken.sub);
			ifal.doc()
				.create({
					authToken: token,
					decodedToken: data,
					expires: decodedToken.exp,
					data: {
						fullName: data.nome,
						email: data.email,
						cpf: data.candidato.cpf,
						rg: data.candidato.rg,
						birthDate: data.candidato.aniversario,
						phoneNumber: data.candidato.telefone,
						address: {
							street: data.candidato.endereco.logradouro,
							neighborhood: data.candidato.endereco.bairro,
							houseNumber: data.candidato.endereco.numero,
							postalCode: data.candidato.endereco.cep,
							city: data.candidato.endereco.cidade.nome,
							state: data.candidato.endereco.cidade.estado.nome,
						},
					},
				})
				.then(() => {
					return res.json(response(false, "Ok."));
				})
				.catch((err) => {
					logger.error(err.message);
					return res
						.status(500)
						.json(
							response(true, "Houve um erro, tente novamente.")
						);
				});
		} catch (err) {
			return res
				.status(500)
				.json(response(true, "Houve um erro, tente novamente."));
		}
	} else {
		return res.status(400).json(response(true, "Token não informado."));
	}
});

export default router;
