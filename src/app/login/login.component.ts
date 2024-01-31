import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private authService: AuthService) { }
  
  async login(username: string, password: string): Promise<void> {
    const res = await this.authService.login(username, password);
    if (res) {
        alert('User logged in successfully');
    }else {
        alert('Incorrect username or password!');
    }
  }
}
