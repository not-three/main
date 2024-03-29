export default defineEventHandler(async (event) => ({
  defaultExpires: (1000 * (Number(process.env.EXPIRY) || 60 * 60 * 24 * 30)),
}));
