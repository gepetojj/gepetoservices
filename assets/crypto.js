import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

function Crypto(algorithm = "aes-256-ctr") {
	/**
	 * Criptografa uma string.
	 * @param {String} string Texto a ser criptografado.
	 * @returns {Object} Retorna um objeto com a key 'error'. Caso error
	 * seja 'false', os dados da criptografia virão juntos. Caso error seja
	 * 'true', apenas essa key existirá.
	 */
	function enc(string) {
		try {
			const key = randomBytes(32);
			const iv = randomBytes(16);

			const cipher = createCipheriv(algorithm, key, iv);
			const encrypted = Buffer.concat([
				cipher.update(string),
				cipher.final(),
			]);

			return { error: false, hash: encrypted.toString("hex"), key, iv };
		} catch (err) {
			console.error(err);
			return { error: true };
		}
	}

	/**
	 * Descriptografa um hash.
	 * @param {String} hash Hash a ser descriptografado.
	 * @param {Buffer} key Chave de criptografia do hash.
	 * @param {Buffer} iv IV do hash.
	 * @returns {Object} Retorna um objeto com a key 'error'. Caso error
	 * seja 'false', virá a 'string' com os dados descriptografados.
	 * Caso error seja 'true', apenas essa key existirá.
	 */
	function dec({ hash, key, iv }) {
		try {
			const decipher = createDecipheriv(
				algorithm,
				key,
				Buffer.from(iv, "hex")
			);

			const decrypted = Buffer.concat([
				decipher.update(Buffer.from(hash, "hex")),
				decipher.final(),
			]);

			return { error: false, result: decrypted.toString() };
		} catch (err) {
			console.error(err);
			return { error: true };
		}
	}

	return { enc, dec };
}

export default Crypto;
