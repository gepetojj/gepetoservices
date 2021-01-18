const validatorLib = require("validator");

function validator(data) {
    let response = [];

    data.forEach((doc) => {
        switch (doc.type) {
            case "username":
                if (validatorLib.isEmpty(doc.value)) {
                    response.push("O usuário não pode ser nulo.");
                    break;
                } else if (!validatorLib.isLength(doc.value, { max: 13 })) {
                    response.push(
                        "O usuário deve ter no máximo 13 caracteres."
                    );
                    break;
                } else if (!validatorLib.isAlphanumeric(doc.value, ["pt-BR"])) {
                    response.push("O usuário só pode ter letras e números.");
                    break;
                }
                break;
            case "email":
                if (validatorLib.isEmpty(doc.value)) {
                    response.push("O email não pode ser nulo.");
                    break;
                } else if (!validatorLib.isEmail(doc.value)) {
                    response.push("O email não é válido.");
                    break;
                }
                break;
            case "password":
                if (validatorLib.isEmpty(doc.value)) {
                    response.push("A senha não pode ser nula.");
                    break;
                } else if (!validatorLib.isLength(doc.value, { min: 10 })) {
                    response.push("A senha deve ter no mínimo 10 caracteres.");
                    break;
                } else if (!validatorLib.isStrongPassword(doc.value)) {
                    response.push(
                        "A senha deve ter pelo menos uma letra minúscula, maiúscula, número e símbolo."
                    );
                    break;
                }
                break;
            case "equals":
                if (validatorLib.isEmpty(doc.value)) {
                    response.push("A senha não pode ser nula.");
                    break;
                } else if (validatorLib.isEmpty(doc.equal)) {
                    response.push("A senha não pode ser nula.");
                    break;
                } else if (!validatorLib.equals(doc.value, doc.equal)) {
                    response.push("A senhas devem ser iguais.");
                    break;
                }
                break;
        }
    });

    return response;
}

module.exports = validator;
