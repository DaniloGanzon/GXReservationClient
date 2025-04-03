import { Injectable } from '@angular/core';
import { format, parse } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {
  constructor() { }

  // Main conversion methods
  prepareReservationForBackend(formData: any): any {
    return {
      ...formData,
      startDate: this.ensureDateFormat(formData.startDate),
      endDate: this.ensureDateFormat(formData.endDate),
      timeStart: this.ensureTimeFormat(formData.timeStart),
      timeDuration: this.ensureDurationFormat(formData.timeDuration)
    };
  }

  prepareReservationForFrontend(backendData: any): any {
    return {
      ...backendData,
      startDate: this.formatDateForDisplay(backendData.startDate),
      endDate: this.formatDateForDisplay(backendData.endDate),
      timeStart: this.formatTimeForDisplay(backendData.timeStart),
      timeDuration: this.parseDuration(backendData.timeDuration)
    };
  }

  // Core helper methods
  private ensureDateFormat(dateString: string): string {
    if (!dateString) return '';
    
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    try {
      // Try parsing as ISO string or MM/DD/YYYY
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'yyyy-MM-dd');
      }
      
      // Try parsing as MM-DD-YYYY
      const parsedDate = parse(dateString, 'MM-dd-yyyy', new Date());
      return format(parsedDate, 'yyyy-MM-dd');
    } catch (e) {
      console.error('Date parsing error:', e);
      return '';
    }
  }

  private ensureTimeFormat(timeString: string): string {
    if (!timeString) return '00:00:00';
    
    // Already in HH:mm:ss format
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) return timeString;
    
    // Convert HH:mm to HH:mm:ss
    if (/^\d{2}:\d{2}$/.test(timeString)) return `${timeString}:00`;
    
    // Convert single number to HH:mm:ss
    if (/^\d{1,2}$/.test(timeString)) {
      return `${timeString.padStart(2, '0')}:00:00`;
    }
    
    return '00:00:00';
  }

  private ensureDurationFormat(duration: string | number): string {
    if (typeof duration === 'number') {
      return `${duration.toString().padStart(2, '0')}:00:00`;
    }
    
    if (!duration) return '00:00:00';
    
    // Already in HH:mm:ss format
    if (/^\d{2}:\d{2}:\d{2}$/.test(duration)) return duration;
    
    // Convert HH:mm to HH:mm:ss
    if (/^\d{2}:\d{2}$/.test(duration)) return `${duration}:00`;
    
    // Convert single number to HH:mm:ss
    if (/^\d{1,2}$/.test(duration)) {
      return `${duration.padStart(2, '0')}:00:00`;
    }
    
    return '00:00:00';
  }

  // Display formatting methods
  formatDateForDisplay(backendDate: string): string {
    if (!backendDate) return '';
    try {
      const date = new Date(backendDate);
      return format(date, 'MM/dd/yyyy');
    } catch (e) {
      console.error('Date display formatting error:', e);
      return '';
    }
  }

  formatTimeForDisplay(backendTime: string): string {
    if (!backendTime) return '';
    // Extract just hours and minutes
    const [hours, minutes] = backendTime.split(':');
    return `${hours}:${minutes}`;
  }

  formatLongDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy'); // "March 30, 2025"
    } catch (e) {
      console.error('Date formatting error:', e);
      return '';
    }
  }

  formatTimeWithPeriod(timeString: string): string {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hourNum = parseInt(hours, 10);
      const period = hourNum >= 12 ? 'pm' : 'am';
      const displayHour = hourNum % 12 || 12;
      return `${displayHour}:${minutes} ${period}`; // "1:00 pm"
    } catch (e) {
      console.error('Time formatting error:', e);
      return '';
    }
  }

  private parseDuration(backendDuration: string): number {
    if (!backendDuration) return 0;
    const [hours] = backendDuration.split(':');
    return parseInt(hours, 10);
  }

  // Utility methods
  calculateEndTime(startTime: string, durationHours: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  doesSpanMidnight(startTime: string, durationHours: number): boolean {
    const [hours] = startTime.split(':').map(Number);
    return (hours + durationHours) >= 24;
  }
}