/**
 * Cria um objeto padrão de resposta da API.
 * @param {Boolean} error Se houve erro na execução da API.
 * @param {String} message Mensagem a ser retornada pela API.
 * @param {Object} optional Parâmetros adicionais opcionais a serem retornados pela API
 * @returns {Object} Retorna um objeto padrão para responder chamadas
 * a API.
 */
function response(error, message, optional = {}) {
	return {
		error,
		message,
		...optional,
	};
}

export default response;
