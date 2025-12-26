import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/notes';
  constructor(private http: HttpClient) {}

  getNotes(search: string = '', archived: boolean = false) {
    return this.http.get(`${this.apiUrl}?search=${search}&is_archived=${archived}`);
  }
  createNote(note: any) { return this.http.post(this.apiUrl, note); }
  updateNote(id: number, note: any) { return this.http.put(`${this.apiUrl}/${id}`, note); }
  deleteNote(id: number) { return this.http.delete(`${this.apiUrl}/${id}`); }
}