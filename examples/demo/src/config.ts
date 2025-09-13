export const config = {
  jwtSecret: process.env['JWT_SECRET'] || 'demo-secret-key-change-in-production',
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
  },
  apiUrl: process.env['API_URL'] || 'http://localhost:3001',
};
