import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ReceveurProfile {
  receveurId: number;
  tauxSucces: number;
  totalMatchs: number;
  totalLivres: number;
  totalRefuses: number;
  distanceMoyenneAcceptee: number;
  categoriesPreferees: string[];
  bonusMalus: number;
  clusterId?: number; // Généré par Python (KMeans)
  scoreFiabilite?: number; // Généré par Python (Random Forest)
}

export interface LearningResult {
  receveurId: number;
  lotId: number;
  scoreBase: number;
  bonusMalus: number;
  scoreFinal: number;
}

@Injectable({ providedIn: 'root' })
export class LearningService {
  private apiUrl = `${environment.restApiMatching}/learning`;

  constructor(private http: HttpClient) {}

  // ✅ Correspond à GET /api/learning/profil/{receveurId}
  getProfilReceveur(receveurId: number): Observable<ReceveurProfile> {
    return this.http.get<ReceveurProfile>(`${this.apiUrl}/profil/${receveurId}`);
  }

  // ✅ Correspond à GET /api/learning/profils
  getAllProfils(): Observable<ReceveurProfile[]> {
    return this.http.get<ReceveurProfile[]>(`${this.apiUrl}/profils`);
  }

  // ✅ Correspond à POST /api/learning/recalculer
  recalculerProfils(): Observable<any> {
    return this.http.post(`${this.apiUrl}/recalculer`, {});
  }

  // ✅ Correspond à POST /api/learning/python-cluster (Déclenche le script ia_engine.py)
  runPythonAi(): Observable<any> {
    return this.http.post(`${this.apiUrl}/python-cluster`, null, { responseType: 'text' });
  }
}