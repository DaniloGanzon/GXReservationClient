import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type DialogType = 'delete' | 'approve' | 'edit' | 'custom';
export type DialogTheme = 'danger' | 'success' | 'warning' | 'info';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to perform this action?';
  @Input() type: DialogType = 'custom';
  @Input() theme: DialogTheme = 'danger';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get iconPath(): string {
    switch (this.type) {
      case 'delete':
        return 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';
      case 'approve':
        return 'M5 13l4 4L19 7';
      case 'edit':
        return 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z';
      default:
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    }
  }

  get themeClasses(): string {
    return {
      'danger': 'bg-red-100 text-red-700',
      'success': 'bg-green-100 text-green-700',
      'warning': 'bg-yellow-100 text-yellow-700',
      'info': 'bg-blue-100 text-blue-700'
    }[this.theme];
  }

  get buttonClasses(): string {
    return {
      'danger': 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      'success': 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      'warning': 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      'info': 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }[this.theme];
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}