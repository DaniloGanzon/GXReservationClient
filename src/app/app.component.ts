import { Component } from '@angular/core';
import { MainComponent } from './pages/layout/main/main.component';
import { SidebarComponent } from './pages/layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    MainComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'GXReservationClient';
  isSidebarCollapsed = false;

  onSidebarToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}
