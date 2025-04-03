// In calendar-reservation-form.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Room } from '../../../../../model/Room';

@Component({
  selector: 'app-calendar-reservation-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './calendar-reservation-form.component.html',
  styleUrl: './calendar-reservation-form.component.css'
})
export class CalendarReservationFormComponent implements OnChanges {
  @Input() room: Room | null = null;
  @Input() minDate: string = '';
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  reservation = {
    name: '',
    purpose: '',
    startDate: '',
    endDate: '',
    timeStart: '08:00',
    timeDuration: 1,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minDate'] && this.minDate) {
      this.enforceMinDate();
    }
  }

  // Updated ngOnInit in calendar-reservation-form.component.ts
ngOnInit() {
  const today = new Date().toISOString().split('T')[0];
  const minDate = this.minDate || today;
  
  // Compare dates as strings (ISO format is comparable)
  const startDate = today >= minDate ? today : minDate;
  const endDate = today >= minDate ? today : minDate;

  this.reservation = {
    name: '',
    purpose: '',
    startDate: startDate,
    endDate: endDate,
    timeStart: '08:00',
    timeDuration: 1,
  };
}

private enforceMinDate(): void {
  if (this.minDate) {
    if (this.reservation.startDate < this.minDate) {
      this.reservation.startDate = this.minDate;
    }
    if (this.reservation.endDate < this.minDate) {
      this.reservation.endDate = this.minDate;
    }
  }
}

  onSubmit(): void {
    const reservationData = {
      name: this.reservation.name,
      purpose: this.reservation.purpose,
      roomId: this.room?.id,
      startDate: this.reservation.startDate,
      endDate: this.reservation.endDate,
      timeStart: this.reservation.timeStart + ':00',
      timeDuration: `${this.reservation.timeDuration.toString().padStart(2, '0')}:00:00`,
      status: 'Approved'
    };
    this.formSubmit.emit(reservationData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onStartDateChange(event: Event): void {
    this.reservation.startDate = (event.target as HTMLInputElement).value;
    this.enforceMinDate();
    if (this.reservation.startDate > this.reservation.endDate) {
      this.reservation.endDate = this.reservation.startDate;
    }
  }

  onEndDateChange(event: Event): void {
    this.reservation.endDate = (event.target as HTMLInputElement).value;
    this.enforceMinDate();
  }
}