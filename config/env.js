const requiredVars = ['JWT_SECRET'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const insecureJwtSecrets = new Set([
  'change-me-in-env',
  'my-secret-key',
  'secret',
  'jwt-secret',
  'password'
]);

if (process.env.NODE_ENV !== 'test') {
  if (process.env.JWT_SECRET.length < 16 || insecureJwtSecrets.has(process.env.JWT_SECRET)) {
    throw new Error('JWT_SECRET is too weak. Use at least 16 random characters.');
  }
}

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toNumber(process.env.PORT, 5000),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: toNumber(process.env.DB_PORT, 3306),
  DB_NAME: process.env.DB_NAME || 'study_group_db',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || '',
  RATE_LIMIT_WINDOW_MS: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  RATE_LIMIT_MAX: toNumber(process.env.RATE_LIMIT_MAX, 300)
};
