import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacultyMember {
  id: number;
  name: string;
  department: string;
  designation: string;
}

export type FacultyInput = Omit<FacultyMember, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class FacultyService {
  private apiUrl = 'http://localhost:3000/faculty';

  constructor(private http: HttpClient) {}

  getFaculty(): Observable<FacultyMember[]> {
    return this.http.get<FacultyMember[]>(this.apiUrl);
  }

  addFaculty(faculty: FacultyInput): Observable<FacultyMember> {
    return this.http.post<FacultyMember>(this.apiUrl, faculty);
  }

  updateFaculty(id: number, faculty: FacultyInput): Observable<FacultyMember> {
    return this.http.put<FacultyMember>(`${this.apiUrl}/${id}`, faculty);
  }

  deleteFaculty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
