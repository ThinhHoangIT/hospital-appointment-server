const Joi = require('joi');
const { PHONE_REGEX, EMAIL_REGEX, FEATURES } = require('../commons/constants');

const validate = (schema, data, isAllOptional = false) => {
  if (isAllOptional) {
    return Joi.object(schema)
      .fork(Object.keys(schema), s => s.optional())
      .validate(data);
  }
  return Joi.object(schema).validate(data);
};

const validateUser = (data, isAllOptional) => {
  const schema = {
    email: Joi.string().min(3).max(100).regex(EMAIL_REGEX).required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(3).max(100).required(),
    phone: Joi.string().min(10).max(15).regex(PHONE_REGEX).allow(''),
    address: Joi.string().allow(''),
    birthday: Joi.string().allow(''),
    gender: Joi.string().allow(''),
  };
  return validate(schema, data, isAllOptional);
};

const validateEmployee = (data, isAllOptional) => {
  const schema = {
    id: Joi.string().required(),
    name: Joi.string().required(),
    department: Joi.string().allow(''),
    role: Joi.string().allow(''),
    phone: Joi.string().min(10).max(15).regex(PHONE_REGEX).allow(''),
    password: Joi.string().min(6).allow(''),
  };
  return validate(schema, data, isAllOptional);
};

const validateLogin = data => {
  const schema = {
    email: Joi.string().min(3).max(100).regex(EMAIL_REGEX).required(),
    password: Joi.string().min(6).required(),
  };
  return validate(schema, data);
};

const validateEmployeeLogin = data => {
  const schema = {
    phone: Joi.string().min(10).max(15).regex(PHONE_REGEX).required(),
    password: Joi.string().min(6).required(),
  };
  return validate(schema, data);
};

const validateRole = (data, isAllOptional) => {
  const schema = {
    id: Joi.string().required(),
    name: Joi.string().required(),
    accessibleFeatures: Joi.array()
      .items(Joi.string().valid(...Object.values(FEATURES)))
      .single()
      .required(),
  };
  return validate(schema, data, isAllOptional);
};

const validateDepartment = (data, isAllOptional) => {
  const schema = {
    id: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    type: Joi.string().allow(''),
  };
  return validate(schema, data, isAllOptional);
};

const validateReview = (data, isAllOptional) => {
  const schema = {
    userId: Joi.string().required(),
    productId: Joi.string().required(),
    rating: Joi.number().min(0).max(5).required(),
    comment: Joi.string().optional(),
  };
  return validate(schema, data, isAllOptional);
};

module.exports = {
  validateLogin,
  validateEmployeeLogin,
  validateUser,
  validateEmployee,
  validateRole,
  validateDepartment,
  validateReview,
};
