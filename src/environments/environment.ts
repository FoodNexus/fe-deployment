/** Local `ng serve`; microservices on separate ports */
export const environment = {
  production: false,
  keycloakUrl: 'http://localhost:8080',

  restApiMatching: 'http://localhost:8082/api',
  restApiAudit: 'http://localhost:8083/api',
  restApiUsers: 'http://localhost:8087/api',
};
