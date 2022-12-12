export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  apiUrl: process.env.API_URL,
  seed: 33331,
});
