const Joi = require("joi");

const validateNewUser = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(4).max(15).required(),
    password: Joi.string().min(4).max(10).required(),
    email: Joi.string().email().required(),
  });
  return schema.validate(user);
};

const validateUpdateUser = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(4).max(15).required(),
    email: Joi.string().email().required(),
  });
  return schema.validate(user);
};

module.exports = {
  validateNewUser,
  validateUpdateUser,
};
