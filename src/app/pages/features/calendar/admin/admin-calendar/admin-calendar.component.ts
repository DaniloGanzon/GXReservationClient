import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseCalendarComponent } from '../../shared/base-calendar/base-calendar.component';
import { TimeFormatPipe } from '../../../../../services/pipe/time-format.pipe';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { RoomService } from '../../../../../services/features/room.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../../confirmation-dialog/confirmation-dialog.component';
import { ReservationService } from '../../../../../services/features/reservation.service';
import { CalendarReservationFormComponent } from '../../shared/calendar-reservation-form/calendar-reservation-form.component';

@Component({
  selector: 'app-admin-calendar',
  standalone: true,
  imports: [
    CommonModule,
    TimeFormatPipe,
    CalendarReservationFormComponent
  ],
  templateUrl: './admin-calendar.component.html',
  styleUrl: './admin-calendar.component.css'
})
export class AdminCalendarComponent extends BaseCalendarComponent {
  constructor(
    protected override reservationService: ReservationService,
    protected override route: ActivatedRoute,
    protected override roomService: RoomService,
    protected override router: Router,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override toastr: ToastrService,
    private dialog: MatDialog
  ) {
    super(reservationService, route, roomService, changeDetectorRef, router, toastr);
  }

  protected override getCalendarTitle(): string {
    return 'Room Calendar';
  }

  protected override getBaseRoute(): string {
    return '/admin/rooms';
  }

  handleReservationDelete(reservationId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Reservation',
        message: 'Are you sure you want to delete this reservation?',
        type: 'delete',
        theme: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });
    
    const dialogComponent = dialogRef.componentInstance;
    dialogComponent.title = 'Delete Reservation';
    dialogComponent.message = 'Are you sure you want to delete this reservation?';
    dialogComponent.type = 'delete';
    dialogComponent.theme = 'danger';
    dialogComponent.confirmText = 'Delete';
    dialogComponent.cancelText = 'Cancel';

    dialogComponent.confirmed.subscribe(() => {
      dialogRef.close();
      this.performDeletion(reservationId);
    });

    dialogComponent.cancelled.subscribe(() => {
      dialogRef.close();
    });
  }

  private performDeletion(reservationId: number): void {
    this.optimisticDelete(reservationId);
    
    this.reservationService.deleteReservation(reservationId).subscribe({
      next: () => {
        this.toastr.success('Reservation deleted successfully', 'Success');
        this.loadReservations();
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.toastr.error('Failed to delete reservation', 'Error');
        this.loadReservations();
      }
    });
  }

  private optimisticDelete(reservationId: number): void {
    this.allReservations = this.allReservations.filter(r => r.id !== reservationId);
    this.generateCalendar();
    
    if (this.selectedDay) {
      const date = new Date(this.currentYear, this.currentMonth, this.selectedDay.date!);
      const dateStr = date.toISOString().split('T')[0];
      this.selectedDayReservations = this.getReservationsForDate(dateStr);
      
      this.selectedDay.isReserved = this.selectedDayReservations.length > 0;
      this.selectedDay.reservation = this.selectedDayReservations.length > 0 
        ? this.selectedDayReservations[0] 
        : undefined;
    }
  }
}