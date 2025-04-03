import { Routes } from '@angular/router';
import { UserRoomListsComponent } from './rooms/employee/user-room-lists/user-room-lists.component';
import { UserCalendarComponent } from './calendar/employee/user-calendar/user-calendar.component';
import { UserReservationListComponent } from './reservations/employee/user-reservation-list/user-reservation-list.component';

export const EMPLOYEE_ROUTES: Routes = [
  // Rooms routes
  {
    path: '',
    children: [
      { path: '', component: UserRoomListsComponent },
      { path: ':id', component: UserCalendarComponent }
    ]
  },

  // Reservations routes
  {
    path: 'reservations',
    children: [
      { path: '', component: UserReservationListComponent }
    ]
  }
];