import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseCalendarComponent } from '../../calendar/shared/base-calendar/base-calendar.component';
import { TimeFormatPipe } from '../../../../services/pipe/time-format.pipe';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReservationService } from '../../../../services/features/reservation.service';
import { RoomService } from '../../../../services/features/room.service';
import { ConfirmationDialogComponent } from '../../../confirmation-dialog/confirmation-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Reservation } from '../../../../model/Reservation';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard-calendar',
  standalone: true,
  imports: [CommonModule, TimeFormatPipe, MatTooltipModule],
  templateUrl: './dashboard-calendar.component.html',
  styleUrls: ['./dashboard-calendar.component.css']
})
export class DashboardCalendarComponent extends BaseCalendarComponent {
  roomColors: string[] = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];
  activeRooms: any[] = [];
  totalReservations: number = 0;
  conflictCount: number = 0;

  constructor(
    protected override reservationService: ReservationService,
    protected override route: ActivatedRoute,
    protected override roomService: RoomService,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override router: Router,
    protected override toastr: ToastrService,
    private dialog: MatDialog,
  ) {
    super(reservationService, route, roomService, changeDetectorRef, router, toastr);
  }

  protected override getCalendarTitle(): string {
    return 'Reservations Dashboard';
  }

  protected override getBaseRoute(): string {
    return '/admin/dashboard';
  }

  protected override loadReservations(): void {
    this.isLoading = true;
    
    // Load rooms first
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.activeRooms = rooms;
        
        // Then load all reservations
        this.reservationService.getAllReservations().subscribe({
          next: (reservations) => {
            this.allReservations = reservations.map(res => ({
              ...res,
              startDate: new Date(res.startDate).toISOString().split('T')[0],
              endDate: new Date(res.endDate).toISOString().split('T')[0]
            }));
            
            // Calculate statistics
            this.totalReservations = this.allReservations.length;
            this.detectConflicts();
            this.generateCalendar();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading reservations:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.isLoading = false;
      }
    });
  }
  
  private detectConflicts(): void {
    this.conflictCount = 0;
    const reservationsByRoom: { [key: number]: Reservation[] } = {};
  
    // Group by room
    this.allReservations.forEach(reservation => {
      if (!reservationsByRoom[reservation.roomId]) {
        reservationsByRoom[reservation.roomId] = [];
      }
      reservationsByRoom[reservation.roomId].push(reservation);
    });
  
    // Check for conflicts in each room
    Object.values(reservationsByRoom).forEach(roomReservations => {
      roomReservations.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      for (let i = 1; i < roomReservations.length; i++) {
        const prevEnd = new Date(roomReservations[i-1].endDate);
        const currStart = new Date(roomReservations[i].startDate);
        
        if (currStart < prevEnd) {
          this.conflictCount++;
        }
      }
    });
  }

  getRoomColor(roomId: number): string {
    const index = this.activeRooms.findIndex(room => room.id === roomId) % this.roomColors.length;
    return this.roomColors[index];
  }

  getRoomName(roomId: number): string {
    const room = this.activeRooms.find(r => r.id === roomId);
    return room ? `${room.name} (Floor ${room.floor})` : 'Unknown Room';
  }

  getReservationTooltip(reservation: any): string {
    return `${reservation.name}\n${this.getRoomName(reservation.roomId)}\n${reservation.startDate} - ${reservation.endDate}`;
  }
}