import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import axios, { AxiosRequestConfig } from 'axios'; // Importe AxiosRequestConfig
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor() { }

  async login(username: string, password: string): Promise<any> {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': environment.jwt_authorization
        }
      };

      const response = await axios.post(`${this.apiUrl}/login`, { username, password }, config);

      if (response && response.data && response.data.access_token) {
        const decodedToken: any = jwt_decode(response.data.access_token);

        const userId: string = decodedToken.id; 
        const username: string = decodedToken.username; 

        this.logout();
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);

        return response.data;
    }
  }

  getUser(): { userId: string | null, username: string | null } {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    return { userId, username };
  }
  

  logout(): boolean {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    return true;
  }
}

function jwt_decode(token: any): any {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
      console.log("error decoding token");
  }
}

