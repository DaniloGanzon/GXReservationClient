import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../../../services/features/room.service';
import { ReservationService } from '../../../../../services/features/reservation.service';
import { Room } from '../../../../../model/Room';
import { Reservation } from '../../../../../model/Reservation';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RoomWithReservations extends Room {
  todayReservations: Reservation[];
  occupiedTime: { start: string, end: string } | null;
  availabilityStatus: 'fully' | 'partially' | 'unavailable';
  reservationCount: number;
}

@Component({
  selector: 'app-user-room-lists',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-room-lists.component.html',
  styleUrls: ['./user-room-lists.component.css']
})
export class UserRoomListsComponent implements OnInit {
  allRooms: Room[] = [];
  filteredRooms: RoomWithReservations[] = [];
  searchTerm: string = '';
  filterOption: string = 'all';
  isLoading = true;
  today = new Date().toISOString().split('T')[0];
  allReservations: Reservation[] = [];

  filterOptions = [
    { value: 'all', label: 'All Rooms' },
    { value: 'today', label: 'Available Today' },
    { value: 'fully-available-week', label: 'Fully Available Next 7 Days' },
    { value: 'has-availability-week', label: 'Has Availability Next 7 Days' }
  ];

  constructor(
    private roomService: RoomService,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.allRooms = rooms;
        this.loadReservations();
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.isLoading = false;
      }
    });
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.allReservations = reservations;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.allReservations = [];
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  getTodayReservationsForRoom(roomId: number): Reservation[] {
    return this.allReservations.filter(res => 
      res.roomId === roomId && 
      res.status === 'Approved' &&
      res.startDate === this.today
    );
  }

  formatOccupiedTime(reservations: Reservation[]): { start: string, end: string } | null {
    if (reservations.length === 0) return null;
    const sorted = [...reservations].sort((a, b) => 
      a.timeStart.localeCompare(b.timeStart)
    );
    const firstStart = sorted[0].timeStart;
    const lastEnd = this.calculateEndTime(sorted[sorted.length - 1].timeStart, sorted[sorted.length - 1].timeDuration);
    return { start: firstStart, end: lastEnd };
  }

  calculateEndTime(startTime: string, duration: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const durationHours = parseInt(duration.split(':')[0], 10);
    let endHours = hours + durationHours;
    if (endHours >= 24) endHours -= 24;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  getRoomAvailabilityStatus(roomId: number): 'fully' | 'partially' | 'unavailable' {
    const today = new Date(this.today);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const reservations = this.allReservations.filter(res => 
      res.roomId === roomId &&
      res.status === 'Approved' &&
      new Date(res.startDate) <= nextWeek &&
      new Date(res.endDate) >= today
    );
    
    if (reservations.length === 0) return 'fully';
    
    const reservedDays = new Set();
    reservations.forEach(res => {
      const start = new Date(res.startDate);
      const end = new Date(res.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d <= nextWeek && d >= today) {
          reservedDays.add(d.toISOString().split('T')[0]);
        }
      }
    });
    
    return reservedDays.size >= 7 ? 'unavailable' : 'partially';
  }

  applyFilters(): void {
    let filtered = this.allRooms.map(room => {
      const todayReservations = this.getTodayReservationsForRoom(room.id);
      const occupiedTime = this.formatOccupiedTime(todayReservations);
      const availabilityStatus = this.getRoomAvailabilityStatus(room.id);
      
      return { 
        ...room, 
        todayReservations,
        occupiedTime,
        availabilityStatus,
        reservationCount: todayReservations.length
      };
    });
    
    if (this.searchTerm) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        room.building.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        room.floor.toString().includes(this.searchTerm)
      );
    }
    
    switch(this.filterOption) {
      case 'today':
        filtered = filtered.filter(room => room.reservationCount === 0);
        break;
      case 'fully-available-week':
        filtered = filtered.filter(room => room.availabilityStatus === 'fully');
        break;
      case 'has-availability-week':
        filtered = filtered.filter(room => room.availabilityStatus !== 'unavailable');
        break;
    }
    
    this.filteredRooms = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  navigateToReservationForm(roomId: number): void {
    this.router.navigate(['rooms', roomId]); 
  }
}