/**
 * Local `ng serve`; microservices on separate ports.
 * Keycloak: `http://localhost:8080` when KC listens at `/` — correct for plain local Keycloak.
 * If local KC uses relative path **`/auth`** (same layout as prod), set **`keycloakUrl`** to
 * **`http://localhost:8080/auth`** (or the port/host you use).
 */
export const environment = {
  production: false,
  keycloakUrl: 'http://localhost:8080',

  restApiMatching: 'http://localhost:8082/api',
  restApiAudit: 'http://localhost:8083/api',
  restApiUsers: 'http://localhost:8087/api',
};
