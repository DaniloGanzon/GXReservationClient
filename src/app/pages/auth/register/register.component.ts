import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, ValidationErrors, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { RegisterModelDto } from '../../../model/authModel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  loginError: string | null = null;
  showRegisterModal: boolean = true;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), this.strongPasswordValidator]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  strongPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password: string = control.value;
    if (!password) return null;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    return isValid ? null : { weakPassword: true };
  };

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
  }

  onLogin(): void {
    if (this.form.invalid) {
      return;
    }
    this.loginError = null;
    const model = this.form.value as RegisterModelDto;
    this.authService.register(model).subscribe({
      next: (response) => {
        this.router.navigate(['/welcome']);
        this.showRegisterModal = false;
      },
      error: (err) => {
        this.loginError = 'Registration failed. Please try again.';
        console.error('Registration failed', err);
      }
    });
  }
}