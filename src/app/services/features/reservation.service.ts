import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reservation } from '../../model/Reservation';
import { AuthService } from '../auth/auth.service';
import { DateTimeService } from '../pipe/time-service.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservation`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private dateTimeService: DateTimeService
  ) {}

  getAllReservations(): Observable<Reservation[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Reservation[]>(this.apiUrl, { headers }).pipe(
      map(reservations => 
        reservations.map(res => 
          this.dateTimeService.prepareReservationForFrontend(res)
        )
      )
    );
  }

  getReservationById(id: number): Observable<Reservation> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`, { headers }).pipe(
      map(res => 
        this.dateTimeService.prepareReservationForFrontend(res)
    ));
  }

  getReservationsByRoom(roomId: number): Observable<Reservation[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Reservation[]>(`${this.apiUrl}/room/${roomId}`, { headers }).pipe(
      map(reservations => 
        reservations.map(res => 
          this.dateTimeService.prepareReservationForFrontend(res)
        )
      )
    );
  }

  createReservation(reservation: any): Observable<Reservation> {
    const formattedReservation = this.dateTimeService.prepareReservationForBackend(reservation);
    const headers = this.authService.getAuthHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
  
    return this.http.post<Reservation>(this.apiUrl, formattedReservation, { headers }).pipe(
      map(res => 
        this.dateTimeService.prepareReservationForFrontend(res)
      )
    );
  }

  updateReservation(id: number, reservation: Partial<Reservation>): Observable<void> {
    const formattedReservation = this.dateTimeService.prepareReservationForBackend(reservation);
    const headers = this.authService.getAuthHeaders();
    return this.http.put<void>(`${this.apiUrl}/${id}`, formattedReservation, { headers });
  }

  deleteReservation(id: number): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  approveReservation(id: number): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.patch<void>(`${this.apiUrl}/${id}/approve`, {}, { headers });
  }

  rejectReservation(id: number): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.patch<void>(`${this.apiUrl}/${id}/reject`, {}, { headers });
  }

  // Helper method to format any reservation for display
  formatReservationForDisplay(reservation: Reservation): any {
    return this.dateTimeService.prepareReservationForFrontend(reservation);
  }
}