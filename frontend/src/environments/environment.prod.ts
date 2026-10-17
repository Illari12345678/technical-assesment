export const environment = {
  production: true,
  // Placeholder inyectado en time de build por Docker/CI:
  // - Docker: ARG API_URL del frontend/Dockerfile (sed sobre este archivo)
  // - GitHub Actions: variable API_URL del repo (build-args en ci.yml)
  // Nota: un `ng run build` local con config producción dejará el placeholder
  // literal; para probar en local usar `ng serve` (usa environment.ts).
  apiUrl: '__API_URL__',
};
