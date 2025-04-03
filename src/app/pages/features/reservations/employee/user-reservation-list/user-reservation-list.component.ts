import { Component, Input, OnInit } from '@angular/core';
import { ReservationService } from '../../../../../services/features/reservation.service';
import { Reservation } from '../../../../../model/Reservation';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../../services/features/room.service';
import { Room } from '../../../../../model/Room';
import { DateTimeService } from '../../../../../services/pipe/time-service.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-reservations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-reservation-list.component.html',
  styleUrls: ['./user-reservation-list.component.css']
})
export class UserReservationListComponent implements OnInit {
  @Input() initialFilter: 'all' | 'Pending' | 'Approved' | 'Rejected' | 'No Room' = 'all';
  @Input() showFilter = true;

  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  rooms: Room[] = [];
  isLoading = true;
  statusFilter = 'all';

  constructor(
    private reservationService: ReservationService,
    private roomService: RoomService,
    private dateTimeService: DateTimeService
  ) {}

  ngOnInit() {
    this.statusFilter = this.initialFilter;
    this.loadData();
  }

  private loadData() {
    this.isLoading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.applyFilter();
        this.loadRooms();
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.isLoading = false;
      }
    });
  }

  private loadRooms() {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    if (this.statusFilter === 'all') {
      this.filteredReservations = [...this.reservations];
    } else if (this.statusFilter === 'No Room') {
      this.filteredReservations = this.reservations.filter(r => 
        this.getRoomName(r.roomId) === 'Unknown Room'
      );
    } else {
      this.filteredReservations = this.reservations.filter(r => r.status === this.statusFilter);
    }
  }

  getRoomName(roomId: number): string {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  }

  getFormattedDateRange(reservation: Reservation): string {
    const startDate = this.dateTimeService.formatLongDate(reservation.startDate);
    const endDate = this.dateTimeService.formatLongDate(reservation.endDate);
    return startDate === endDate ? startDate : `${startDate} to ${endDate}`;
  }

  getFormattedTimeRange(reservation: Reservation): string {
    if (!reservation.timeStart) return '';
    
    const startTime = this.dateTimeService.formatTimeWithPeriod(reservation.timeStart);
    const durationHours = this.getDurationHours(reservation.timeDuration);
    const endTime = this.dateTimeService.formatTimeWithPeriod(
      this.dateTimeService.calculateEndTime(reservation.timeStart, durationHours)
    );
    
    return `${startTime} - ${endTime}`;
  }

  getDurationDisplay(duration: string | number): string {
    const hours = this.getDurationHours(duration);
    return `${hours} Hour${hours !== 1 ? 's' : ''}`;
  }

  private getDurationHours(duration: string | number): number {
    if (typeof duration === 'number') return duration;
    if (!duration) return 0;
    
    const parts = duration.split(':');
    const hours = parseInt(parts[0], 10);
    return isNaN(hours) ? 0 : hours;
  }
}