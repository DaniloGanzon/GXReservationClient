import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { LoginModelDto } from '../../../model/authModel';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginError: string | null = null;
  showLoginModal: boolean = true;
  form!: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.form.invalid) {
      return;
    }
    this.loginError = null;
    const model = this.form.value as LoginModelDto;
    this.authService.login(model).subscribe({
      next: (response) => {
        const role = this.authService.getUserRole();
        if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'Employee') {
          this.router.navigate(['/rooms']);  
        }
        this.showLoginModal = false;
        this.toastr.success('Login successful!', 'Welcome!');
      },
      error: (err) => {
        this.loginError = 'Invalid credentials. Please try again.';
        console.error('Login failed', err);
        this.toastr.error('Invalid credentials. Please try again.', 'Login failed');
      }
    });
  }  
}
