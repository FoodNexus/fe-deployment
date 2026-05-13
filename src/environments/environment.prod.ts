/**
 * Production / cluster: same origin; Ingress routes `/api` → API Gateway, `/auth` → Keycloak (NodePort 31956 lab).
 * Align **Root URL / Home URL** and KC **Valid redirect URIs** / **Web origins** with `appOrigin` (see OAuth runbook).
 */
export const environment = {
  production: true,
  /** SPA public origin (slash-terminated; mirrors ConfigMap APP_ORIGIN). */
  appOrigin: 'https://foodnexus-app.example.com:31956/',
  /** keycloak-js server base (KC behind relative path `/auth`). */
  keycloakUrl: 'https://foodnexus-app.example.com:31956/auth',
  /** OIDC issuer (align with ConfigMap KEYCLOAK_ISSUER_ORIGIN). */
  keycloakIssuerOrigin: 'https://foodnexus-app.example.com:31956/auth/realms/foodnexus',
  keycloakRealm: 'foodnexus',
  keycloakClientId: 'foodnexus-app',

  restApiMatching: '/api',
  restApiAudit: '/api',
  restApiUsers: '/api',
};
