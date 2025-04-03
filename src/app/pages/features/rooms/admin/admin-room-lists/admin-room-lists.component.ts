import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../../../services/features/room.service';
import { ReservationService } from '../../../../../services/features/reservation.service';
import { Room } from '../../../../../model/Room';
import { Reservation } from '../../../../../model/Reservation';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../../../../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';

interface RoomWithReservations extends Room {
  reservationCount: number; 
}

@Component({
  selector: 'app-admin-room-lists',
  imports: [
    CommonModule, FormsModule, ConfirmationDialogComponent
  ],
  templateUrl: './admin-room-lists.component.html',
  styleUrl: './admin-room-lists.component.css'
})
export class AdminRoomListsComponent  implements OnInit {
  allRooms: Room[] = [];
  filteredRooms: RoomWithReservations[] = [];
  searchTerm: string = '';
  isLoading = true;
  allReservations: Reservation[] = [];
  showDeleteDialog = false;
  selectedRoom: Room | null = null;

  constructor(
    private roomService: RoomService,
    private reservationService: ReservationService,
    private router: Router,
    private toastr: ToastrService 
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

  getReservationsForRoom(roomId: number): Reservation[] {
    const today = new Date().toISOString().split('T')[0]; 
    return this.allReservations.filter(res => 
      res.roomId === roomId && 
      res.startDate <= today && 
      res.endDate >= today
    );
  }

  applyFilters(): void {
    let filtered = this.allRooms.map(room => {
      const count = this.getReservationsForRoom(room.id).length;
      return { ...room, reservationCount: count };
    });
    
    if (this.searchTerm) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        room.building.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        room.floor.toString().includes(this.searchTerm)
      );
    }
    this.filteredRooms = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  navigateToCalendar(roomId: number): void {
    this.router.navigate(['/admin/rooms/', roomId]); 
  }

  navigateToRoomForm(): void {
    this.router.navigate(['/admin/rooms/new']);
  }

  editRoom(room: Room): void {
    this.router.navigate(['/admin/rooms/edit', room.id]);
  }

  deleteRoom(room: Room): void {
    this.selectedRoom = room;
    this.showDeleteDialog = true;
  }

  onDeleteConfirmed(): void {
    if (this.selectedRoom?.id) {
      this.roomService.deleteRoom(this.selectedRoom.id).subscribe({
        next: () => {
          this.toastr.success('Room deleted successfully', 'Success');
          this.loadRooms();
        },
        error: (error) => {
          this.toastr.error('Failed to delete room', 'Error');
          console.error('Error deleting room:', error);
        }
      });
    }
    this.showDeleteDialog = false;
    this.selectedRoom = null;
  }

  onDialogCancel(): void {
    this.showDeleteDialog = false;
    this.selectedRoom = null;
  }
}