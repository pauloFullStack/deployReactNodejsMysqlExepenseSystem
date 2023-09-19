const LoginUsers = require('../models/UsersModel');
const { Op } = require("sequelize");

const checkUserExists = async (email, user, typeMethod = "post") => {
    try {
        let emailBd;
        let userBd;
        let objReturn = {};
        if (typeMethod === "post") {
            emailBd = await LoginUsers.findOne({
                where: {
                    email: email,
                },
            });
            userBd = await LoginUsers.findOne({
                where: {
                    user: user,
                },
            });
        } else if (typeMethod === "put") {
            emailBd = await LoginUsers.findAll({
                where: {
                    email: {
                        [Op.ne]: email, // Não verifica o proprio email
                    },
                },
            });
            userBd = await LoginUsers.findAll({
                where: {
                    user: {
                        [Op.ne]: user, // Não verifica o proprio user
                    },
                },
            });
        }

        if (emailBd && emailBd.dataValues.id) {
            objReturn['email'] = true;
        }

        if (userBd && userBd.dataValues.id) {
            objReturn['user'] = true;
        }

        return objReturn;
        
    } catch (error) {
        return false;
    }
};


module.exports = {
    checkUserExists,
};