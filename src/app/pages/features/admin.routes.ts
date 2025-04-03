import { Routes } from '@angular/router';
import { DashboardCalendarComponent } from './dashboard/dashboard-calendar/dashboard-calendar.component';
import { AdminRoomListsComponent } from './rooms/admin/admin-room-lists/admin-room-lists.component';
import { RoomFormComponent } from './rooms/admin/room-form/room-form.component';
import { AdminCalendarComponent } from './calendar/admin/admin-calendar/admin-calendar.component';
import { AdminReservationListComponent } from './reservations/admin/admin-reservation-list/admin-reservation-list.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardCalendarComponent },

  // Rooms management
  {
    path: 'rooms',
    children: [
      { path: '', component: AdminRoomListsComponent },
      { path: 'new', component: RoomFormComponent },
      { path: 'edit/:id', component: RoomFormComponent },
      { path: ':id', component: AdminCalendarComponent }
    ]
  },

  // Reservations management
  {
    path: 'reservations',
    children: [
      { path: '', component: AdminReservationListComponent },
    ]
  }
];