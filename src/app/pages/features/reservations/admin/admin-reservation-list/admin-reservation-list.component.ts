import { Component, Input, OnInit } from '@angular/core';
import { ReservationService } from '../../../../../services/features/reservation.service';
import { Reservation } from '../../../../../model/Reservation';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../../services/features/room.service';
import { Room } from '../../../../../model/Room';
import { ConfirmationDialogComponent } from '../../../../confirmation-dialog/confirmation-dialog.component';
import { DateTimeService } from '../../../../../services/pipe/time-service.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

type ActionType = 'approve' | 'reject';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent, FormsModule, RouterModule],
  templateUrl: './admin-reservation-list.component.html',
  styleUrls: ['./admin-reservation-list.component.css']
})
export class AdminReservationListComponent implements OnInit {
  @Input() initialFilter: 'all' | 'Pending' | 'Approved' | 'Rejected' | 'No Room' = 'all';
  @Input() showFilter = true;
  @Input() showActions = true;

  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  rooms: Room[] = [];
  isLoading = true;
  statusFilter = 'all';
  
  // Dialog states
  showDeleteDialog = false;
  showActionDialog = false;
  reservationToDelete: number | null = null;
  currentAction: { type: ActionType, id: number } | null = null;

  constructor(
    private reservationService: ReservationService,
    private roomService: RoomService,
    private dateTimeService: DateTimeService,
    private toastr: ToastrService
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
        this.toastr.error('Failed to load reservations', 'Error');
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

  openActionDialog(reservationId: number, type: ActionType) {
    this.currentAction = { type, id: reservationId };
    this.showActionDialog = true;
  }

  openDeleteDialog(reservationId: number) {
    this.reservationToDelete = reservationId;
    this.showDeleteDialog = true;
  }

  handleActionConfirm() {
    if (this.currentAction) {
      if (this.currentAction.type === 'approve') {
        this.approveReservation(this.currentAction.id);
      } else {
        this.rejectReservation(this.currentAction.id);
      }
    }
    this.showActionDialog = false;
    this.currentAction = null;
  }

  handleDeleteConfirm() {
    if (this.reservationToDelete) {
      this.deleteReservation(this.reservationToDelete);
    }
    this.showDeleteDialog = false;
    this.reservationToDelete = null;
  }

  approveReservation(id: number) {
    this.reservationService.approveReservation(id).subscribe({
      next: () => {
        this.loadData();
        this.toastr.success('Reservation approved successfully');
      },
      error: (error) => {
        console.error('Error approving reservation:', error);
        this.toastr.error('Failed to approve reservation');
      }
    });
  }

  rejectReservation(id: number) {
    this.reservationService.rejectReservation(id).subscribe({
      next: () => {
        this.loadData();
        this.toastr.success('Reservation rejected successfully');
      },
      error: (error) => {
        console.error('Error rejecting reservation:', error);
        this.toastr.error('Failed to reject reservation');
      }
    });
  }

  deleteReservation(id: number) {
    this.reservationService.deleteReservation(id).subscribe({
      next: () => {
        this.loadData();
        this.toastr.success('Reservation deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting reservation:', error);
        this.toastr.error('Failed to delete reservation');
      }
    });
  }
}