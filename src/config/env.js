import joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = joi.object({
  PORT: joi.number().default(3000),
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  CLIENT_URL: joi.string().uri().required().description('Frontend client URL for CORS'),
  DB_USER: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_HOST: joi.string().default('localhost'),
  DB_PORT: joi.number().default(5432),
  DB_NAME: joi.string().required(),
  JWT_SECRET: joi.string().required(),
  JWT_REFRESH_SECRET: joi.string().required(),
  JWT_EXPIRES_IN: joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: joi.string().default('30d'),
  LOG_LEVEL: joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
  UPLOAD_PATH: joi.string().default('uploads/'),
}).unknown().required();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  clientUrl: envVars.CLIENT_URL,
  db: {
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },
  logLevel: envVars.LOG_LEVEL,
  uploadPath: envVars.UPLOAD_PATH,
};
