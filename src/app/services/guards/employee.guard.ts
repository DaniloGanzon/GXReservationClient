import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class EmployeeGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.auth.getUserRole();
    if (role === 'Employee') return true;
    this.router.navigate(['/signin']);
    return false;
  }
}