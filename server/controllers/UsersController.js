const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Users = require('../models/UsersModel');
const { body, validationResult } = require('express-validator');
const { validateEmail } = require('../utils/validations')
const { checkUserExists } = require('../helpers/validateUserExists');

// @desc    Get All users
// @route   GET /api/v1/expense/users
// @access  Private
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const data = await Users.findAll();
  res.status(200).json({
    success: true,
    data: data,
  });
});


// @desc    Create user
// @route   POST /api/v1/expense/users
// @access  Public
exports.createUser = [

  body('name')
    .trim()
    .notEmpty()
    .withMessage('O campo "Nome" é obrigatório!')
    .customSanitizer((value) => {
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('O campo "Email" é obrigatório!')
    .customSanitizer((value) => {
      // Sua lógica de sanitização do email aqui, se necessário
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }),

  body('lestName')
    .trim()
    .notEmpty()
    .withMessage('O campo "Sobre Nome" é obrigatório!')
    .customSanitizer((value) => {
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('O campo "Nova Senha" é obrigatório!')
    .customSanitizer((value) => {
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }),

  body('passwordRepeat')
    .trim()
    .notEmpty()
    .withMessage('O campo "Repetir Senha" é obrigatório!')
    .customSanitizer((value) => {
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }),

  asyncHandler(async (req, res, next) => {
    const data = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        notification: true,
        warningNotification: true,
        messageNotification: "Preencha os campos obrigatórios!",
        errorFields: errors
      });
    }

    if (!validateEmail(data.email)) {
      return res.status(200).json({
        success: false,
        notification: true,
        warningNotification: true,
        messageNotification: "O email não é valido!",
        errorFields: { errors: { 0: { msg: 'O email não é valido!', path: 'email' } } }
      });
    }

    const objReturn = await checkUserExists(data.email, data.user);

    if (objReturn.email || objReturn.user) {
      let emailExists = objReturn.email == true ? 'O email já está cadastrado!' : '';
      let userExists = objReturn.user == true ? ' O usuário já está cadastrado!' : '';
      const userAndEmailExists = objReturn.user == true && objReturn.email == true ? ' O email e usuário já estão cadastrado!' : '';
      if (userAndEmailExists != '') {
        emailExists = '';
        userExists = '';
      }

      let emailErrorObj = {};
      let userErrorObj = {};
      let userAndEmailErrorObj = {};

      const pathEmail = `${emailExists != '' ? emailErrorObj = { errors: { 0: { msg: emailExists, path: 'email' } } } : ''}`;
      const pathUser = `${userExists != '' ? userErrorObj = { errors: { 0: { msg: userExists, path: 'user' } } } : ''}`;
      const pathEmailAndUser = `${userAndEmailExists != '' ? userAndEmailErrorObj = {
        errors: {
          0: { msg: 'O email já está cadastrado!', path: 'email' },
          1: {
            msg: 'O usuário já está cadastrado!', path: 'user'
          }
        }
      } : ''}`;
      console.log(emailErrorObj)
      console.log(userErrorObj)
      console.log(userAndEmailErrorObj)
      return res.status(200).json({
        success: false,
        notification: true,
        warningNotification: true,
        messageNotification: `${emailExists} ${userExists} ${userAndEmailExists}`,
        toastConfig: { autoClose: 5000 },
        errorFields: pathEmail != '' ? emailErrorObj : pathUser != '' ? userErrorObj : pathEmailAndUser != '' ? userAndEmailErrorObj : ''
      });
    }


    const letraMinuscula = /[a-z]/g;
    const letraMaiuscula = /[A-Z]/g;
    const numeral = /[0-9]/;
    const caracterEspecial = /[!@@#$%^&*(),.?":{}|<>]/;

    if (!data.password.length >= 8) {
      return res.status(200).json({
        success: false,
        validatingPassword: true,
        typeValidation: 'setFirstCondition',
        messageNotification: 'A senha deve conter todos os requisitos abaixo!'
      });
    } else if (!data.password.match(letraMinuscula)) {
      return res.status(200).json({
        success: false,
        validatingPassword: true,
        typeValidation: 'setSecondCondition',
        messageNotification: 'A senha deve conter todos os requisitos abaixo!'
      });
    } else if (!data.password.match(letraMaiuscula)) {
      return res.status(200).json({
        success: false,
        validatingPassword: true,
        typeValidation: 'setFiveCondition',
        messageNotification: 'A senha deve conter todos os requisitos abaixo!'
      });
    } else if (!numeral.test(data.password)) {
      return res.status(200).json({
        success: false,
        validatingPassword: true,
        typeValidation: 'setThirdCondition',
        messageNotification: 'A senha deve conter todos os requisitos abaixo!'
      });
    } else if (!caracterEspecial.test(data.password)) {
      return res.status(200).json({
        success: false,
        validatingPassword: true,
        typeValidation: 'setFourthCondition',
        messageNotification: 'A senha deve conter todos os requisitos abaixo!'
      });
    }

    if (data.password !== data.passwordRepeat) {
      return res.status(200).json({
        success: false,
        notification: true,
        warningNotification: true,
        messageNotification: `O campo 'Repetir Senha' deve ser igual ao campo 'Nova Senha'!`,
        toastConfig: { autoClose: 5000 },
        errorFields: { errors: { 0: { msg: 'Os campos "Nova senha" e "Repetir Senha devem ser iguais !', path: 'password' }, 1: { msg: 'Os campos "Nova senha" e "Repetir Senha devem ser iguais!"', path: 'passwordRepeat' } } }
      });
    }

    // Para o 'bcrypt' criptografar la na model, deve-se usar a função 'create' para inserção de dados
    await Users.create(data);

    res.status(200).json({
      success: true,
      notification: true,
      successNotification: true,
      messageNotification:
        'Conta criada com sucesso!',
    });
  }),

];