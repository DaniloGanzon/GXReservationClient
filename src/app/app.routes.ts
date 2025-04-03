import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { AdminGuard } from './services/guards/admin.guard';
import { EmployeeGuard } from './services/guards/employee.guard';
import { AuthGuard } from './services/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: LoginComponent },
  { path: 'signup', component: RegisterComponent },

  // Admin routes - lazy loaded
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('../app/pages/features/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // Employee routes - lazy loaded
  {
    path: 'rooms',
    canActivate: [AuthGuard, EmployeeGuard],
    loadChildren: () => import('../app/pages/features/employee.routes').then(m => m.EMPLOYEE_ROUTES)
  },

  // Fallback route (should be last)
  { path: '**', redirectTo: 'signin' }
];