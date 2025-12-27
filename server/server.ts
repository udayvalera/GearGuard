import app from './app.js';

const PORT = process.env.PORT || 5000;
const apiVersion = '/api/v1';

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/v1`);
});