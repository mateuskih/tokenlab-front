import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import axios from 'axios';
import { UserModel } from '../models/user.model';
import { EventModel } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor() { }

  async createUser(username: string, password: string): Promise<UserModel> {
    try {
      const response = await axios.post<UserModel>(this.apiUrl, { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getInvitedEvents(userId: number): Promise<{ event: EventModel; status: string }[]> {
    try {
      const response = await axios.get<{ event: EventModel; status: string }[]>(`${this.apiUrl}/invited/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findAllUsers(): Promise<UserModel[]> {
    try {
      const response = await axios.get<UserModel[]>(this.apiUrl);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findUserById(id: number): Promise<UserModel> {
    try {
      const response = await axios.get<UserModel>(`${this.apiUrl}/id/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findUserByUsername(username: string): Promise<UserModel> {
    try {
      const response = await axios.get<UserModel>(`${this.apiUrl}/username/${username}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async findUserByUsernameAndPassword(username: string, password: string): Promise<UserModel> {
    try {
      const response = await axios.post<UserModel>(`${this.apiUrl}/login`, { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: number, username: string, password: string): Promise<UserModel> {
    try {
      const response = await axios.put<UserModel>(`${this.apiUrl}/${userId}`, { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await axios.delete<void>(`${this.apiUrl}/${userId}`);
    } catch (error) {
      throw error;
    }
  }
}
