import validatorLib from 'validator';
import textPack from './textPack.json';

/**
 * Valida e sanitiza dados.
 * @param {Object} data Dados a serem sanitizados usando o padrão.
 * @returns {Array} Retorna uma lista com os possíveis erros. A lista
 * terá length 0 caso nenhum erro ocorra.
 */
function validator(data) {
	let response = [];

	data.forEach((doc) => {
		switch (doc.type) {
			case "username":
				if (validatorLib.isEmpty(doc.value)) {
					response.push(textPack.validator.username.null);
					break;
				} else if (!validatorLib.isLength(doc.value, { max: 13 })) {
					response.push(textPack.validator.username.length);
					break;
				} else if (!validatorLib.isAlphanumeric(doc.value, ["pt-BR"])) {
					response.push(textPack.validator.username.alphanumeric);
					break;
				}
				break;
			case "email":
				if (validatorLib.isEmpty(doc.value)) {
					response.push(textPack.validator.email.null);
					break;
				} else if (!validatorLib.isEmail(doc.value)) {
					response.push(textPack.validator.email.valid);
					break;
				}
				break;
			case "password":
				if (validatorLib.isEmpty(doc.value)) {
					response.push(textPack.validator.password.null);
					break;
				} else if (!validatorLib.isLength(doc.value, { min: 10 })) {
					response.push(textPack.validator.password.length);
					break;
				} else if (!validatorLib.isStrongPassword(doc.value)) {
					response.push(textPack.validator.password.strong);
					break;
				}
				break;
			case "equals":
				if (validatorLib.isEmpty(doc.value)) {
					response.push(textPack.validator.password.null);
					break;
				} else if (validatorLib.isEmpty(doc.equal)) {
					response.push(textPack.validator.password.null);
					break;
				} else if (!validatorLib.equals(doc.value, doc.equal)) {
					response.push(textPack.validator.equals.equal);
					break;
				}
				break;
		}
	});

	return response;
}

export default validator;
