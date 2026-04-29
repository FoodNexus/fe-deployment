import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../../services/produit.service';
import { ProduitResponse } from '../../../models/produit.model';
import { CategorieProduit } from '../../../models/enums.model';

@Component({
  selector: 'app-produit-list',
  templateUrl: './produit-list.component.html',
  styleUrls: ['./produit-list.component.scss']
})
export class ProduitListComponent implements OnInit {

  produits: ProduitResponse[] = [];
  searchKeyword = '';
  selectedCategorie = '';
  categories = Object.values(CategorieProduit);
  successMessage = '';
  errorMessage = '';
  Math = Math;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.produits.length / this.pageSize);
  }

  get paginatedProduits(): ProduitResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.produits.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.produitService.getAll().subscribe({
      next: data => {
        this.produits = data;
        this.currentPage = 1;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des produits.';
      }
    });
  }

  rechercher(): void {
    if (this.searchKeyword.trim()) {
      this.produitService.rechercher(this.searchKeyword).subscribe({
        next: data => {
          this.produits = data;
          this.currentPage = 1;
        },
        error: () => this.loadProduits()
      });
    } else {
      this.loadProduits();
    }
  }

  filtrerParCategorie(): void {
    if (this.selectedCategorie) {
      this.produitService.getByCategorie(this.selectedCategorie as CategorieProduit).subscribe({
        next: data => {
          this.produits = data;
          this.currentPage = 1;
        },
        error: () => {
          this.errorMessage = 'Erreur lors du filtrage.';
        }
      });
    } else {
      this.loadProduits();
    }
  }

  supprimer(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.errorMessage = '';
      this.produitService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Produit supprimé avec succès !';
          this.loadProduits();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message
            ?? "Erreur lors de la suppression. Le produit est peut-être lié à d'autres données.";
          setTimeout(() => (this.errorMessage = ''), 5000);
        }
      });
    }
  }

  getCategorieClass(categorie: string): string {
    switch (categorie) {
      case 'FRAIS':   return 'cat-frais';
      case 'SURGELE': return 'cat-surgele';
      case 'SEC':     return 'cat-sec';
      default:        return 'cat-default';
    }
  }

  reinitialiser(): void {
    this.searchKeyword = '';
    this.selectedCategorie = '';
    this.errorMessage = '';
    this.loadProduits();
  }
}