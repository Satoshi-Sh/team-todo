const Joi = require("joi");

const validateNewProject = (project) => {
  const schema = Joi.object({
    title: Joi.string().min(4).max(25).required(),
    due: Joi.date().iso().required(),
    description: Joi.string().min(4).max(500).required(),
  });
  return schema.validate(project);
};

module.exports = {
  validateNewProject,
};
