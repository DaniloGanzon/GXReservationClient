import { Component } from '@angular/core';
import { AdminReservationListComponent } from '../admin-reservation-list/admin-reservation-list.component';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports:[
    AdminReservationListComponent  ],
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.css']
})
export class ReservationManagementComponent {
  activeTab: 'pending' | 'history' | 'all' = 'pending';
}