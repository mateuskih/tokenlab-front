import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import axios from 'axios';
import { EventModel } from '../models/event.model';
import { ConviteStatusEnum } from '../models/invitation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor() { }

  async addEvent(description: string, startTime: Date, endTime: Date, userId: number, invitedUserIds: number[]): Promise<EventModel> {
    try {
      const response = await axios.post<EventModel>(this.apiUrl, {
        description,
        startTime,
        endTime,
        userId,
        invitedUserIds
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async respondToEventInvitation(eventId: number, userId: number, responseStatus: 'accept' | 'decline'): Promise<{ event: string; status: ConviteStatusEnum }> {
    try {
      const res = await axios.post<{ event: string; status: ConviteStatusEnum }>(`${this.apiUrl}/respond/${userId}/${eventId}`, { response: responseStatus });
      return res.data;
    } catch (error) {
      throw error;
    }
}


  async getEventsByUserId(userId: number): Promise<EventModel[]> {
    try {
      const response = await axios.get<EventModel[]>(`${this.apiUrl}/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async editEvent(eventId: number, description: string, startTime: Date, endTime: Date): Promise<EventModel> {
    try {
      const response = await axios.put<EventModel>(`${this.apiUrl}/${eventId}`, { description, startTime, endTime });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async removeEvent(eventId: number): Promise<void> {
    try {
      await axios.delete<void>(`${this.apiUrl}/${eventId}`);
    } catch (error) {
      throw error;
    }
  }
}
