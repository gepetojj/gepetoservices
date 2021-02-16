const crypto = require("crypto");

function Crypto(algorithm = "aes-256-ctr") {
	function enc(string) {
		const key = crypto.randomBytes(32);
		const iv = crypto.randomBytes(16);

		const cipher = crypto.createCipheriv(algorithm, key, iv);
		const encrypted = Buffer.concat([
			cipher.update(string),
			cipher.final(),
		]);

		return { hash: encrypted.toString("hex"), key, iv };
	}

	function dec({ hash, key, iv }) {
		const decipher = crypto.createDecipheriv(
			algorithm,
			key,
			Buffer.from(iv, "hex")
		);

		const decrypted = Buffer.concat([
			decipher.update(Buffer.from(hash, "hex")),
			decipher.final(),
		]);

		return decrypted.toString();
	}

	return { enc, dec };
}

module.exports = Crypto;
