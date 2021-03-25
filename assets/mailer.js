require("dotenv").config();
import { createTransport } from "nodemailer";
import ejs from "ejs";

import logger from "./logger";
import Performance from "./tests/performance";

/**
 * Envia um email.
 * @param {String} template Nome do template a ser enviado no email.
 * @param {Object} templateParams Parâmetros do template.
 * @param {String} target Email do receptor.
 * @param {String} subject Assunto do email.
 * @returns {Promise} Retorna undefined caso o email seja enviado com
 * sucesso.
 */
function mailer({ template, templateParams, target, subject }) {
	const promise = new Promise(async (resolve, reject) => {
		const performanceLog = new Performance("emails");
		try {
			const transporter = createTransport({
				host: "smtp.gmail.com",
				port: 465,
				secure: true,
				auth: {
					user: process.env.MAIL_USER,
					pass: process.env.MAIL_PASS,
				},
			});

			let renderedHtml;

			ejs.renderFile(
				`${process.cwd()}/assets/templates/${template}.ejs`,
				templateParams,
				(err, html) => {
					if (err) {
						performanceLog.finish();
						logger.error(err.message);
						return reject(err);
					}

					renderedHtml = html;
				}
			);

			const { err } = await transporter.sendMail({
				from: `GepetoServices <${process.env.MAIL_USER}>`,
				to: target,
				subject,
				html: renderedHtml,
			});
			if (err) {
				performanceLog.finish();
				logger.error(err.message);
				return reject(err);
			}
			performanceLog.finish();
			return resolve();
		} catch (err) {
			performanceLog.finish();
			logger.error(err.message);
			return reject(err);
		}
	});
	return promise;
}

export default mailer;
