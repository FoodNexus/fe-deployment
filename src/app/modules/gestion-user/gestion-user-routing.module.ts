import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: 'produits', redirectTo: '/donneur/produits', pathMatch: 'full' },
      { path: 'lots', redirectTo: '/donneur/lots', pathMatch: 'full' },
      { path: 'matchs', redirectTo: '/donneur/matchs', pathMatch: 'full' },
      { path: 'historique', redirectTo: '/donneur/historique', pathMatch: 'full' },
      { path: 'matching/lancer', redirectTo: '/donneur/matching/lancer', pathMatch: 'full' },
      { path: 'matching/resultat', redirectTo: '/donneur/matching/resultat', pathMatch: 'full' },
      { path: 'ai/dashboard', redirectTo: '/donneur/ai/dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionUserRoutingModule { }
