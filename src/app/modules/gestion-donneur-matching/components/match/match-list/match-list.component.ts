import { Component, OnInit } from '@angular/core';
import { MatchFractionneService } from '../../../services/match-fractionne.service';
import { LotService } from '../../../services/lot.service';
import { AuthService } from '../../../../gestion-user/services/auth.service';
import { MatchFractionneResponse } from '../../../models/match-fractionne.model';
import { StatutMatch } from '../../../models/enums.model';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss']
})
export class MatchListComponent implements OnInit {

  allMyMatchs: MatchFractionneResponse[] = [];
  matchs: MatchFractionneResponse[] = [];
  searchKeyword = '';
  selectedStatut = '';
  statuts = Object.values(StatutMatch);
  successMessage = '';
  errorMessage = '';
  isLoading = true;
  Math = Math;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.matchs.length / this.pageSize);
  }

  get paginatedMatchs(): MatchFractionneResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.matchs.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  get currentDonneurId(): number {
    return this.authService.getCurrentUser()?.idUser || 0;
  }

  get donorName(): string {
    return this.authService.getUsername() || 'Donneur';
  }

  constructor(
    private matchService: MatchFractionneService,
    private lotService: LotService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.getCurrentUser()) {
      this.loadMatchs();
    } else {
      this.authService.fetchUserProfile().subscribe({
        next: () => this.loadMatchs(),
        error: () => this.errorMessage = 'Impossible de récupérer votre profil.'
      });
    }
  }

  loadMatchs(): void {
    const userId = this.currentDonneurId;
    if (userId === 0) { this.isLoading = false; return; }

    // On récupère les lots du Donneur, puis on filtre les matchs par ces IDs de lots
    this.lotService.getByDonneurId(userId).subscribe({
      next: lotsData => {
        const myLotIds = lotsData.map(l => l.idLot);
        this.matchService.getAll().subscribe({
          next: allMatchs => {
            this.allMyMatchs = allMatchs.filter(m => myLotIds.includes(m.lotId));
            this.applyLocalFilters();
            this.isLoading = false;
          },
          error: () => { this.errorMessage = 'Erreur de chargement des matchs.'; this.isLoading = false; }
        });
      },
      error: () => { this.errorMessage = 'Erreur de chargement de vos lots.'; this.isLoading = false; }
    });
  }

  applyLocalFilters(): void {
    let filtered = [...this.allMyMatchs];

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(m =>
        m.dateMatch?.toLowerCase().includes(kw) ||
        m.statutMatch?.toLowerCase().includes(kw) ||
        m.scoreMatching?.toString().includes(kw)
      );
    }

    if (this.selectedStatut) {
      filtered = filtered.filter(m => m.statutMatch === this.selectedStatut);
    }

    this.matchs = filtered;
    this.currentPage = 1;
  }

  rechercher(): void { this.applyLocalFilters(); }
  filtrerParStatut(): void { this.applyLocalFilters(); }

  reinitialiser(): void {
    this.searchKeyword = '';
    this.selectedStatut = '';
    this.applyLocalFilters();
  }

  changerStatut(id: number, statut: string): void {
    this.matchService.changerStatut(id, statut as StatutMatch).subscribe({
      next: () => {
        this.successMessage = 'Statut modifié avec succès !';
        this.loadMatchs();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la modification du statut.';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  getStatutClass(s: string): string {
    switch (s) {
      case 'EN_ATTENTE_LOGISTIQUE': return 'statut-en-cours';
      case 'CONFIRME':              return 'statut-disponible';
      case 'LIVRE':                 return 'statut-termine';
      case 'REFUSE':                return 'statut-refuse';
      case 'ANNULE':                return 'statut-annule';
      default:                      return 'statut-default';
    }
  }

  getStatutLabel(s: string): string {
    switch (s) {
      case 'EN_ATTENTE_LOGISTIQUE': return 'En attente';
      case 'CONFIRME':              return 'Confirmé';
      case 'LIVRE':                 return 'Livré';
      case 'REFUSE':                return 'Refusé';
      case 'ANNULE':                return 'Annulé';
      default:                      return s;
    }
  }

  getStatutIcon(s: string): string {
    switch (s) {
      case 'EN_ATTENTE_LOGISTIQUE': return 'bi-hourglass-split';
      case 'CONFIRME':              return 'bi-check-circle-fill';
      case 'LIVRE':                 return 'bi-truck';
      case 'REFUSE':                return 'bi-x-circle-fill';
      case 'ANNULE':                return 'bi-slash-circle';
      default:                      return 'bi-circle';
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-mid';
    return 'score-low';
  }
}