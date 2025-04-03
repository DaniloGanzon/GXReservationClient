import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<boolean>();
  isCollapsed = false;
  activeRoute = '';
  isAuthenticated = false;
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.authSubscription = this.authService.authState$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      }
    );
  }

  get isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
  }

  setActiveRoute(route: string) {
    this.activeRoute = route;
  }

  onLogout() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Logout Confirmation',
        message: 'Are you sure you want to logout?',
        type: 'custom',
        theme: 'warning',
        confirmText: 'Logout',
        cancelText: 'Cancel'
      }
    });

    dialogRef.componentInstance.confirmed.subscribe(() => {
      this.authService.removeToken();
      dialogRef.close();
      this.router.navigate(['/signin']);  // Add navigation to signin
    });

    dialogRef.componentInstance.cancelled.subscribe(() => {
      dialogRef.close();
    });
  }
}