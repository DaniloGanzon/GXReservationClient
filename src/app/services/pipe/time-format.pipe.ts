import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(timeString: string): string {
    if (!timeString) return '';
    
    // Split the time string into hours, minutes, seconds
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    
    // Determine am/pm
    const period = hourNum >= 12 ? 'pm' : 'am';
    const displayHour = hourNum % 12 || 12; // Convert 0 to 12 for 12am
    
    // Format minutes with leading zero if needed
    const displayMinutes = minutes.padStart(2, '0');
    
    return `${displayHour}:${displayMinutes} ${period}`;
  }
}