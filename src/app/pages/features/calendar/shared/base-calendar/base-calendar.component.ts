// base-calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../../../services/features/reservation.service';
import { Reservation } from '../../../../../model/Reservation';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Room } from '../../../../../model/Room';
import { RoomService } from '../../../../../services/features/room.service';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-base-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './base-calendar.component.html',
  styleUrls: ['./base-calendar.component.css']
})
export class BaseCalendarComponent implements OnInit {
  @Input() selectedDay: {date: number | null, isReserved: boolean, reservation?: Reservation} | null = null;
  @Input() selectedDayReservations: Reservation[] = [];
  protected roomId: number | null = null;
  protected room: Room | null = null;
  protected rooms: Room[] = [];
  protected currentDate: Date = new Date();
  protected currentMonth!: number;
  protected currentYear!: number;
  protected weeks: {date: number | null, isReserved: boolean, reservation?: Reservation}[][] = [];
  protected showReservationForm = false;
  protected isLoading = true;
  protected allReservations: Reservation[] = [];

  // Form properties
  protected reservation = {
    name: '',
    purpose: '',
    startDate: '',
    endDate: '',
    timeStart: '08:00',
    timeDuration: 1,
  };

  protected minDate: string;

  constructor(
    protected reservationService: ReservationService,
    protected route: ActivatedRoute,
    protected roomService: RoomService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected router: Router,
    protected toastr: ToastrService
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    
    this.loadAllRooms();
    
    this.route.params.subscribe(params => {
      this.roomId = +params['id'];
      this.loadRoom();
      this.loadReservations();
    });
  }

  protected getCalendarTitle(): string {
    return 'Room Calendar';
  }

  protected loadAllRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms: Room[]) => {
        this.rooms = rooms;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  protected onRoomChange(event: Event): void {
    const selectedRoomId = +(event.target as HTMLSelectElement).value;
    if (selectedRoomId) {
      this.router.navigate([this.getBaseRoute(), selectedRoomId]).then(() => {
        this.selectedDay = null;
        this.selectedDayReservations = [];
      });
    }
  }

  protected getBaseRoute(): string {
    return '/rooms'; // Default route, override in child components
  }

  protected loadRoom(): void {
    if (this.roomId) {
      this.selectedDay = null;
      this.selectedDayReservations = [];
      
      this.roomService.getRoomById(this.roomId).subscribe({
        next: (room: Room) => {
          this.room = room;
        },
        error: (error) => {
          console.error('Error loading room:', error);
        }
      });
    }
  }

  protected loadReservations(): void {
    if (this.roomId) {
      this.isLoading = true;
      this.allReservations = [];
  
      const selectedDate = this.selectedDay?.date;
      
      this.reservationService.getReservationsByRoom(this.roomId).pipe(
        map((reservations: Reservation[]) => {
          // Filter for approved reservations only
          return reservations
            .filter(res => res.status === 'Approved')
            .map(res => ({
              ...res,
              startDate: new Date(res.startDate).toISOString().split('T')[0],
              endDate: new Date(res.endDate).toISOString().split('T')[0]
            }));
        })
      ).subscribe({
        next: (reservations: Reservation[]) => {
          this.allReservations = reservations;
          this.generateCalendar();
          this.isLoading = false;
          
          // If there was a selected day before loading, re-select it
          if (selectedDate !== undefined) {
            for (const week of this.weeks) {
              for (const day of week) {
                if (day.date === selectedDate) {
                  this.selectDay(day);
                  break;
                }
              }
            }
          }
        },
        error: (error) => {
          console.error('Error loading reservations:', error);
          this.isLoading = false;
        }
      });
    }
  }

  protected generateCalendar(): void {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay();

    this.weeks = [];
    let dayCounter = 1;

    for (let week = 0; week < 6; week++) {
        const weekDays = [];
        
        for (let day = 0; day < 7; day++) {
            if (week === 0 && day < firstDayOfMonth) {
                weekDays.push({date: null, isReserved: false});
            } else if (dayCounter > daysInMonth) {
                weekDays.push({date: null, isReserved: false});
            } else {
                const date = new Date(this.currentYear, this.currentMonth, dayCounter);
                const dateStr = date.toISOString().split('T')[0];
                const reservationsForDay = this.allReservations.filter(res => 
                    dateStr >= res.startDate && dateStr <= res.endDate
                );
                const isReserved = reservationsForDay.length > 0;
                
                weekDays.push({
                    date: dayCounter,
                    isReserved: isReserved,
                    reservation: isReserved ? reservationsForDay[0] : undefined
                });
                dayCounter++;
            }
        }
        
        this.weeks.push(weekDays);
        if (dayCounter > daysInMonth) break;
    }
    
    this.weeks = [...this.weeks];
  }

  protected getReservationsForDate(dateStr: string): Reservation[] {
    const searchDate = new Date(dateStr);
    searchDate.setHours(0, 0, 0, 0);
    
    const reservations = this.allReservations.filter(res => {
      const startDate = new Date(res.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(res.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      return searchDate >= startDate && searchDate <= endDate;
    });
    return reservations;
  }

  protected isSelected(date: number | null): boolean {
    if (!this.selectedDay || date === null) return false;
    return date === this.selectedDay.date;
  }

  protected formatSelectedDate(): string {
    if (!this.selectedDay || this.selectedDay.date === null) return '';
    const date = new Date(this.currentYear, this.currentMonth, this.selectedDay.date);
    return date.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  protected goToToday(): void {
    const today = new Date();
    this.currentDate = today;
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    
    // Regenerate the calendar first
    this.generateCalendar();
    
    // Then select today's date
    const todayDate = today.getDate();
    for (const week of this.weeks) {
      for (const day of week) {
        if (day.date === todayDate) {
          this.selectDay(day);
          break;
        }
      }
    }
  }

  protected previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.loadReservations();
  }

  protected nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.loadReservations();
  }

  protected getMonthName(): string {
    return new Date(this.currentYear, this.currentMonth, 1).toLocaleDateString('default', { month: 'long', year: 'numeric' });
  }

  protected getDayName(dayIndex: number): string {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
  }

  protected isToday(date: number | null): boolean {
    if (date === null) return false;
    const today = new Date();
    return date === today.getDate() && 
           this.currentMonth === today.getMonth() && 
           this.currentYear === today.getFullYear();
  }
  
  protected selectDay(day: {date: number | null, isReserved: boolean, reservation?: Reservation}): void {
    if (day.date === null) return;
    
    this.showReservationForm = false;
    
    const date = new Date(this.currentYear, this.currentMonth, day.date);
    const dateStr = date.toISOString().split('T')[0];
    this.selectedDay = day;
    this.selectedDayReservations = this.getReservationsForDate(dateStr);
    
    // Force change detection
    this.changeDetectorRef.detectChanges();
  }

  protected getEndTime(startTime: string, duration: string | number): string {
    if (!startTime || !duration) return '';
    
    const durationHours = typeof duration === 'string' 
      ? parseInt(duration.split(':')[0], 10) 
      : duration;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  protected showAddReservationForm(): void {
    this.selectedDay = null;
    this.selectedDayReservations = [];
    this.showReservationForm = true;
    
    const today = new Date().toISOString().split('T')[0];
    this.reservation = {
      name: '',
      purpose: '',
      startDate: today,
      endDate: today,
      timeStart: '08:00',
      timeDuration: 1,
    };
  }

  protected handleReservationSubmit(reservationData: any): void {
    if (!this.roomId) return;
  
    this.reservationService.createReservation(reservationData).subscribe({
      next: () => {
        this.showReservationForm = false;
        this.loadReservations();
        this.toastr.success('Reservation created successfully!', 'Success'); // Add this
        
        if (reservationData.startDate === reservationData.endDate) {
          const date = new Date(reservationData.startDate);
          if (date.getMonth() === this.currentMonth && date.getFullYear() === this.currentYear) {
            const dayToSelect = date.getDate();
            for (const week of this.weeks) {
              for (const day of week) {
                if (day.date === dayToSelect) {
                  this.selectDay(day);
                  break;
                }
              }
            }
          }
        }
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.toastr.error('Failed to create reservation', 'Error'); // Add this
      }
    });
  }

  protected onStartDateChange(event: Event): void {
    this.reservation.startDate = (event.target as HTMLInputElement).value;
    if (this.reservation.startDate > this.reservation.endDate) {
      this.reservation.endDate = this.reservation.startDate;
    }
  }

  protected onEndDateChange(event: Event): void {
    this.reservation.endDate = (event.target as HTMLInputElement).value;
  }
}