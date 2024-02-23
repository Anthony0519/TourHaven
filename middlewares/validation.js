const hapiJoiValidator = require("@hapi/joi");

const signUpValidation = (req, res, next) => {
  const validateSignup = hapiJoiValidator.object({
    firstName: hapiJoiValidator
      .string()
      .min(3)
      .max(40)
      .trim()
      .pattern(/^[a-zA-Z]+$/)
      .required()
      .messages({
        "string.empty": "firstName cannot be empty",
        "string.min": "Min 3 characters", // Corrected typo in the message
      }),
    lastName: hapiJoiValidator
      .string()
      .min(3)
      .max(40)
      .trim()
      .pattern(/^[a-zA-Z]+$/)
      .required()
      .messages({
        "string.empty": "lastName cannot be empty",
        "string.min": "Min 3 characters",
      }),
    phoneNumber: hapiJoiValidator
      .string()
      .min(11)
      .trim()
      .regex(/^\d{11}$/)
      .required()
      .messages({
        "string.empty": "phone number cannot be empty",
        "string.pattern.base": "Invalid phone number format", // Added a pattern validation message
      }),
    email: hapiJoiValidator
      .string()
      .email({ tlds: { allow: false } })
      .trim()
      .min(5)
      .required()
      .messages({
        "string.empty": "email cannot be empty",
        "string.email": "Invalid email format",
      }),
    password: hapiJoiValidator.string().min(8).max(30).required().messages({
      "string.empty": "password cannot be empty",
      "string.min": "Min 8 characters for password",
      "string.max": "Max 30 characters for password",
    }),
  });

  const { firstName, lastName, email, phoneNumber, password } = req.body;

  const { message } = validateSignup.validate({
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
  });

  if (message) {
    return res.status(400).json({
      message: message.details.map((detail) => detail.message), // Return an array of all message messages
    });
  }

  next();
};

const resetPasswordValidation = (req, res, next) => {
  const validatePassword = hapiJoiValidator.object({
    password: hapiJoiValidator.string().min(8).max(30).required().messages({
      "string.empty": "password cannot be empty",
      "string.min": "Min 8 characters for password",
      "string.max": "Max 30 characters for password",
    }),
  });

  const { password } = req.body;

  const { message } = validatePassword.validate({ password });

  if (message) {
    return res.status(400).json({
      message: message.details.map((detail) => detail.message), // Return an array of all message messages
    });
  }

  next();
};

const updateValidation = (req, res, next) => {
  const validateUpdate = hapiJoiValidator.object({
    firstName: hapiJoiValidator
      .string()
      .min(3)
      .max(40)
      .trim()
      .pattern(/^[a-zA-Z]+$/)
      .required()
      .messages({
        "string.empty": "firstName cannot be empty",
        "string.min": "Min 3 characters", // Corrected typo in the message
      }),
    lastName: hapiJoiValidator
      .string()
      .min(3)
      .max(40)
      .trim()
      .pattern(/^[a-zA-Z]+$/)
      .required()
      .messages({
        "string.empty": "lastName cannot be empty",
        "string.min": "Min 3 characters",
      }),
    phoneNumber: hapiJoiValidator
      .string()
      .min(11)
      .trim()
      .regex(/^\d{11}$/)
      .required()
      .messages({
        "string.empty": "phone number cannot be empty",
        "string.pattern.base": "Invalid phone number format", // Added a pattern validation message
      }),
  });

  const { firstName, lastName, phoneNumber } = req.body;

  const { message } = validateUpdate.validate({
    firstName,
    lastName,
    phoneNumber,
  });

  if (message) {
    return res.status(400).json({
      message: message.details.map((detail) => detail.message), // Return an array of all message messages
    });
  }

  next();
};

const forgotValidation = (req, res, next) => {
  const validateforgot = hapiJoiValidator.object({
    email: hapiJoiValidator
      .string()
      .email({ tlds: { allow: false } })
      .trim()
      .min(5)
      .required()
      .messages({
        "string.empty": "email cannot be empty",
        "string.email": "Invalid email format",
      }),
  });

  const { email } = req.body;

  const { message } = validateforgot.validate({ email });

  if (message) {
    return res.status(400).json({
      message: message.details.map((detail) => detail.message), // Return an array of all message messages
    });
  }

  next();
};

module.exports = {
  signUpValidation,
  resetPasswordValidation,
  updateValidation,
  forgotValidation,
};
