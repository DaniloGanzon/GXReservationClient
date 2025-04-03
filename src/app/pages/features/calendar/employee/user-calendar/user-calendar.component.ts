import { Component } from '@angular/core';
import { BaseCalendarComponent } from '../../shared/base-calendar/base-calendar.component';
import { CommonModule } from '@angular/common';
import { CalendarReservationFormComponent } from '../../shared/calendar-reservation-form/calendar-reservation-form.component';
import { TimeFormatPipe } from '../../../../../services/pipe/time-format.pipe';
import { ReservationService } from '../../../../../services/features/reservation.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../../../services/features/room.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-calendar',
  standalone: true,
  imports: [
    CommonModule,
    TimeFormatPipe,
    CalendarReservationFormComponent
  ],
  templateUrl: './user-calendar.component.html',
  styleUrls: ['./user-calendar.component.css']
})
export class UserCalendarComponent extends BaseCalendarComponent {
  
  constructor(
    protected override reservationService: ReservationService,
    protected override route: ActivatedRoute,
    protected override roomService: RoomService,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override router: Router,
    protected override toastr: ToastrService
  ) {
    super(reservationService, route, roomService, changeDetectorRef, router, toastr);
  }


  protected override getCalendarTitle(): string {
    return 'Room Calendar';
  }

  protected override getBaseRoute(): string {
    return '/rooms';
  }
}