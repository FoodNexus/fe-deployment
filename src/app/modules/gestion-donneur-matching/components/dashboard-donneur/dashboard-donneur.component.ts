import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../gestion-user/services/auth.service';
import { ProduitService } from '../../services/produit.service';
import { LotService } from '../../services/lot.service';
import { MatchFractionneService } from '../../services/match-fractionne.service';
import { HistoriqueService } from '../../services/historique.service';
import { ProduitResponse } from '../../models/produit.model';
import { LotResponse } from '../../models/lot.model';
import { MatchFractionneResponse } from '../../models/match-fractionne.model';
import { HistoriqueResponse } from '../../models/historique.model';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-dashboard-donneur',
  templateUrl: './dashboard-donneur.component.html',
  styleUrls: ['./dashboard-donneur.component.scss']
})
export class DashboardDonneurComponent implements OnInit {

  produits: ProduitResponse[] = [];
  lots: LotResponse[] = [];
  matchs: MatchFractionneResponse[] = [];
  alertes: HistoriqueResponse[] = [];

  // Community Metrics
  totalLotsCommunaute = 0;
  totalDonneursActifs = 0;
  tauxMatchingGlobal = 0;

  constructor(
    private produitService: ProduitService,
    private lotService: LotService,
    private matchService: MatchFractionneService,
    private historiqueService: HistoriqueService,
    private authService: AuthService
  ) {}

  get currentDonneurId(): number {
    return this.authService.getCurrentUser()?.idUser || 0;
  }

  get donorName(): string {
    return this.authService.getUsername() || 'Donneur';
  }

  ngOnInit(): void {
    if (this.authService.getCurrentUser()) {
      this.loadDashboardData();
    } else {
      this.authService.fetchUserProfile().subscribe({
        next: () => this.loadDashboardData(),
        error: () => console.error("Erreur de récupération du profil.")
      });
    }
  }

  loadDashboardData(): void {
    const userId = this.currentDonneurId;
    if (userId === 0) return;

    this.lotService.getByDonneurId(userId).subscribe(lotsData => {
      this.lots = lotsData;
      const myLotIds = this.lots.map(l => l.idLot);

      // Charger les alertes filtrées par mes lots
      this.historiqueService.getPeremptionProche().subscribe(alertesData => {
        this.alertes = alertesData.filter(a => myLotIds.includes(a.lotId));
      });

      // Charger les matchs filtrés par mes lots
      this.matchService.getAll().subscribe(matchsData => {
        this.matchs = matchsData.filter(m => myLotIds.includes(m.lotId));
      });
    });

    // Produits : catalogue global toujours visible (indépendant des lots)
    this.produitService.getAll().subscribe(pData => this.produits = pData);

    // Chargement des données communautaires (Globales)
    this.lotService.getAll().subscribe(allLots => {
      this.totalLotsCommunaute = allLots.length;
      
      // Calculer le nombre de donneurs uniques qui ont participé
      const donneursSet = new Set(allLots.map(l => l.donneurId));
      this.totalDonneursActifs = donneursSet.size;

      // Calculer le taux de lots completés/matchés globalement
      if (allLots.length > 0) {
        const lotsMatches = allLots.filter(l => l.statut === 'MATCH_VALIDE' || l.statut === 'ORIENTE_RECYCLAGE').length;
        this.tauxMatchingGlobal = Math.round((lotsMatches / allLots.length) * 100);
      }
    });
  }

  get lotsCritiques(): LotResponse[] {
    return this.lots.filter(l => l.niveauUrgence === 'CRITIQUE' && l.statut === 'PREDIT_DISPONIBLE');
  }

  get matchsEnAttente(): MatchFractionneResponse[] {
    return this.matchs.filter(m => m.statutMatch === 'EN_ATTENTE_LOGISTIQUE');
  }

  get lotsDisponibles(): LotResponse[] {
    return this.lots.filter(l => l.statut === 'PREDIT_DISPONIBLE');
  }

  get lotsValides(): LotResponse[] {
    return this.lots.filter(l => l.statut === 'MATCH_VALIDE');
  }
}