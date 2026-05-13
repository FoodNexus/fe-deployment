/**
 * Production / cluster: same origin; Ingress routes `/api` → API Gateway, `/auth` → Keycloak (NodePort 31956 lab).
 */
export const environment = {
  production: true,
  /** keycloak-js server base (KC behind relative path `/auth`). */
  keycloakUrl: 'https://foodnexus-app.example.com:31956/auth',
  /** OIDC issuer (align with ConfigMap KEYCLOAK_ISSUER_ORIGIN / resource servers). */
  keycloakIssuerOrigin: 'https://foodnexus-app.example.com:31956/auth/realms/foodnexus',

  restApiMatching: '/api',
  restApiAudit: '/api',
  restApiUsers: '/api',
};
