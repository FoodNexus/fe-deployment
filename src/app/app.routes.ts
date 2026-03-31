import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'audit',
    loadChildren: () => import('./modules/audit-conformite-contrat-numerique/audit-conformite-contrat-numerique.module')
      .then(m => m.AuditConformiteContratNumeriqueModule)
  },
  { path: '', redirectTo: 'audit', pathMatch: 'full' }
];