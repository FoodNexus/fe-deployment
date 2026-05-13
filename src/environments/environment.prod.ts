/**
 * Production / cluster: same origin as the SPA; Ingress routes /api → apigateway (see Kubernetes handoff).
 * Keycloak: set to the browser-reachable Keycloak base URL (same host if IdP is behind the same ingress,
 * or a dedicated hostname). Change if your realm is not on this origin.
 */
export const environment = {
  production: true,
  keycloakUrl: 'https://foodnexus-app.example.com:31956',

  restApiMatching: '/api',
  restApiAudit: '/api',
  restApiUsers: '/api',
};
