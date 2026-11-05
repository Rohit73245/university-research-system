import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Laboratory {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: 'Available' | 'Occupied';
}

export type LaboratoryInput = Omit<Laboratory, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {
  private apiUrl = 'http://localhost:3000/laboratories';

  constructor(private http: HttpClient) {}

  getLaboratories(): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(this.apiUrl);
  }

  addLaboratory(laboratory: LaboratoryInput): Observable<Laboratory> {
    return this.http.post<Laboratory>(this.apiUrl, laboratory);
  }

  updateLaboratory(id: number, laboratory: LaboratoryInput): Observable<Laboratory> {
    return this.http.put<Laboratory>(`${this.apiUrl}/${id}`, laboratory);
  }

  deleteLaboratory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
