import { KeycloakService } from 'keycloak-angular';
import { environment } from '../environments/environment';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloakUrl,
        realm: 'foodnexus',
        clientId: 'foodnexus-app'  // Remplacez par votre client ID
      },
      initOptions: {
        onLoad: 'login-required',  // Plus de check-sso, plus besoin du fichier HTML
        checkLoginIframe: false,
        pkceMethod: 'S256'
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: ['/assets']
    });
}