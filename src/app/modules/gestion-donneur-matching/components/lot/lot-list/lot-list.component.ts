import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../gestion-user/services/auth.service';
import { LotService } from '../../../services/lot.service';
import { LotResponse } from '../../../models/lot.model';
import { StatutLot, NiveauUrgence } from '../../../models/enums.model';

@Component({
  selector: 'app-lot-list',
  templateUrl: './lot-list.component.html',
  styleUrls: ['./lot-list.component.scss']
})
export class LotListComponent implements OnInit {

  allMyLots: LotResponse[] = [];
  lots: LotResponse[] = [];
  searchKeyword = '';
  selectedStatut = '';
  selectedUrgence = '';
  statuts = Object.values(StatutLot);
  urgences = Object.values(NiveauUrgence);
  successMessage = '';
  errorMessage = '';
  Math = Math;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.lots.length / this.pageSize);
  }

  get paginatedLots(): LotResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.lots.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  constructor(
    private lotService: LotService,
    private authService: AuthService
  ) {}

  get currentDonneurId(): number {
    return this.authService.getCurrentUser()?.idUser || 0;
  }

  get donorName(): string {
    return this.authService.getUsername() || 'Donneur Partenaire';
  }

  ngOnInit(): void {
    if (this.authService.getCurrentUser()) {
      this.loadLots();
    } else {
      this.authService.fetchUserProfile().subscribe({
        next: () => this.loadLots(),
        error: () => this.errorMessage = "Impossible de récupérer votre profil."
      });
    }
  }

  loadLots(): void {
    const userId = this.currentDonneurId;
    if (userId === 0) {
      this.errorMessage = 'Erreur: Identifiant utilisateur introuvable.';
      return;
    }

    this.lotService.getByDonneurId(userId).subscribe({
      next: data => { 
        this.allMyLots = data; 
        this.applyLocalFilters(); 
      },
      error: () => this.errorMessage = 'Erreur lors du chargement de vos lots.'
    });
  }

  applyLocalFilters(): void {
    let filtered = [...this.allMyLots];

    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      // On cherche par ID Lot plutôt que par ID Donneur (puisque le donneur est toujours le même ici)
      filtered = filtered.filter(l => l.idLot.toString().includes(keyword));
    }

    if (this.selectedStatut) {
      filtered = filtered.filter(l => l.statut === this.selectedStatut);
    }

    if (this.selectedUrgence) {
      filtered = filtered.filter(l => l.niveauUrgence === this.selectedUrgence);
    }

    this.lots = filtered;
    this.currentPage = 1;
  }

  rechercher(): void {
    this.applyLocalFilters();
  }

  filtrerParStatut(): void {
    this.applyLocalFilters();
  }

  filtrerParUrgence(): void {
    this.applyLocalFilters();
  }

  supprimer(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce lot ?')) {
      this.errorMessage = '';
      this.lotService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Lot supprimé avec succès !';
          this.loadLots();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message
            ?? "Erreur lors de la suppression. Le lot est peut-être lié à d'autres données.";
          setTimeout(() => (this.errorMessage = ''), 5000);
        }
      });
    }
  }

  reinitialiser(): void {
    this.searchKeyword = '';
    this.selectedStatut = '';
    this.selectedUrgence = '';
    this.errorMessage = '';
    this.applyLocalFilters();
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'PREDIT_DISPONIBLE': return 'statut-disponible';
      case 'EN_COURS_MATCHING': return 'statut-en-cours';
      case 'MATCH_VALIDE':      return 'statut-termine';
      case 'ORIENTE_RECYCLAGE': return 'statut-recycle';
      default:                  return 'statut-default';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'PREDIT_DISPONIBLE': return 'Disponible';
      case 'EN_COURS_MATCHING': return 'En cours';
      case 'MATCH_VALIDE':      return 'Validé';
      case 'ORIENTE_RECYCLAGE': return 'Recyclage';
      default:                  return statut;
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'PREDIT_DISPONIBLE': return 'bi-check-circle-fill';
      case 'EN_COURS_MATCHING': return 'bi-hourglass-split';
      case 'MATCH_VALIDE':      return 'bi-patch-check-fill';
      case 'ORIENTE_RECYCLAGE': return 'bi-recycle';
      default:                  return 'bi-circle';
    }
  }

  getUrgenceClass(urgence: string): string {
    switch (urgence) {
      case 'CRITIQUE': return 'urgence-critique';
      case 'HAUTE':    return 'urgence-haute';
      case 'NORMALE':  return 'urgence-normale';
      case 'BASSE':    return 'urgence-basse';
      default:         return 'urgence-normale';
    }
  }
}