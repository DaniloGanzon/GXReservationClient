import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Room } from '../../model/Room';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/room`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createRoom(room: Omit<Room, 'id'>): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}