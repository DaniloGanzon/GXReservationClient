import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RoomService } from '../../../../../services/features/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../../../../../model/Room';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.css']
})
export class RoomFormComponent implements OnInit {
  roomForm: FormGroup;
  isEditMode = false;
  roomId: number | null = null;
  currentRoom: Room | null = null;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      building: ['', Validators.required],
      floor: ['', Validators.required],
      status: ['Available', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.roomId = +params['id'];
          return this.roomService.getRoomById(this.roomId);
        }
        return of(null);
      })
    ).subscribe({
      next: (room) => {
        if (room) {
          this.currentRoom = room;
          this.roomForm.patchValue({
            name: room.name,
            building: room.building,
            floor: room.floor,
            status: room.status || 'Available'
          });
        }
      },
      error: (error) => {
        this.toastr.error('Failed to load room data', 'Error');
        console.error('Error loading room:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly', 'Validation');
      return;
    }

    const formData = this.roomForm.value;
    const roomData: Room = {
      id: this.roomId || 0,
      name: formData.name,
      building: formData.building,
      floor: formData.floor.toString(),
      status: formData.status
    };

    if (this.isEditMode && this.roomId) {
      this.updateRoom(roomData);
    } else {
      this.createRoom(roomData);
    }
  }

  private createRoom(roomData: Room): void {
    const { id, ...createData } = roomData;
    
    this.roomService.createRoom(createData).subscribe({
      next: (createdRoom) => {
        this.toastr.success('Room created successfully', 'Success');
        this.router.navigate(['/admin/rooms', createdRoom.id]);
      },
      error: (error) => {
        this.handleError('create', error);
      }
    });
  }

  private updateRoom(roomData: Room): void {
    if (!this.roomId) return;

    this.roomService.updateRoom(this.roomId, roomData).subscribe({
      next: () => {
        this.toastr.success('Room updated successfully', 'Success');
        this.router.navigate(['/admin/rooms/calendar', this.roomId]);
      },
      error: (error) => {
        this.handleError('update', error);
      }
    });
  }

  private handleError(operation: string, error: any): void {
    let errorMessage = `Failed to ${operation} room`;
    
    if (error.error) {
      errorMessage += `: ${typeof error.error === 'string' 
        ? error.error 
        : error.error.title || JSON.stringify(error.error.errors)}`;
    }

    this.toastr.error(errorMessage, 'Error');
    console.error(`Error ${operation} room:`, error);
  }

  onCancel(): void {
    if (this.roomId) {
      this.router.navigate(['/admin/rooms/calendar', this.roomId]);
    } else {
      this.router.navigate(['/admin/rooms']);
    }
  }
}