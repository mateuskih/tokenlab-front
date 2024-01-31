import { Component, signal, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventInput, EventDropArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { EventService } from '../services/event.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'home-root',
  standalone: true,
  imports: [FullCalendarModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('calendar', { static: true }) calendarComponent!: FullCalendarComponent;
  userId: any;

  calendarVisible = signal(true);
  calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'dayGridMonth',
    initialEvents: this.getEvents.bind(this), 
    eventColor: 'green',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventDrop: this.handleEventDrop.bind(this) 
  });

  currentEvents = signal<EventApi[]>([]);

  constructor(private changeDetector: ChangeDetectorRef, private eventService: EventService, private userService: UserService, private authService: AuthService) {
    const { userId } = this.authService.getUser(); 
    this.userId = userId;
  }

  ngOnInit() {
    this.loadEvents();
  }

  async handleEventDrop(dropInfo: EventDropArg) {
    const calendarApi = dropInfo.view.calendar;
    const event = dropInfo.event;    
  
    if (event.start !== null && event.end !== null) {
      const startDateForDB = new Date(event.start);
      const endDateForDB = new Date(event.end);
  
      await this.eventService.editEvent(
        Number(event.id), 
        event.title, 
        startDateForDB,
        endDateForDB    
      );
  
      calendarApi.refetchEvents();
    } else {
      console.error("Event start or end time is null.");
    }
  }
  

  handleCalendarToggle() {
    this.calendarVisible.update((bool) => !bool);
  }

  handleWeekendsToggle() {
    this.calendarOptions.update((options) => ({
      ...options,
      weekends: !options.weekends,
    }));
  }

  async handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new description for your event');
    const calendarApi = selectInfo.view.calendar;
    const invites = [];
    const users = await this.userService.findAllUsers();
  
    calendarApi.unselect();
  
    if (title) {
      // Verifica conflitos de horário com outros eventos
      const events = calendarApi.getEvents();
      const newEventRange = {
        start: selectInfo.start,
        end: selectInfo.end
      };
  
      const hasConflict = events.some(existingEvent => {
        const existingEventRange = {
          start: existingEvent.start,
          end: existingEvent.end
        };
        return this.doRangesOverlap(newEventRange, existingEventRange);
      });
  
      if (hasConflict) {
        alert('There is a conflicting event at this time. Please choose a different time.');
        return;
      }
  
      // Continua com a criação do evento se não houver conflito
      while (true) {
        let optionsMessage = "Select users to add as guests:\n";
    
        users.forEach((user, index) => {
            optionsMessage += `${index + 1}. ${user.username}\n`;
        });
    
        let userInput: string | null = prompt(optionsMessage + "Enter the user number or '0' to finish:");
    
        if (userInput === '0') {
            break;
        }
    
        let userIndex: number = parseInt(userInput || '');
    
        if (!isNaN(userIndex) && userIndex >= 1 && userIndex <= users.length) {
            invites.push(users[userIndex - 1].id);
            alert(`User ${users[userIndex - 1].username} has been added to the invites.`);
        } else {
            alert("Invalid option. Please try again.");
        }
      }
      
      let startDate = new Date(selectInfo.start);
      let endDate = new Date(selectInfo.end);
  
      startDate.setHours(startDate.getHours() - 3);
      endDate.setHours(endDate.getHours() - 3);
  
      const response = await this.eventService.addEvent(title, startDate, endDate, this.userId, invites);
  
      calendarApi.addEvent({
        id: response.id.toString(),
        title: response.description,
        start: selectInfo.start,
        end: selectInfo.end,
        allDay: selectInfo.allDay,
        color: 'blue'
      });
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    if(clickInfo.event.backgroundColor === 'red'){
      if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        this.eventService.removeEvent(Number(clickInfo.event.id));
        clickInfo.event.remove();
      }
    }
    else if(clickInfo.event.backgroundColor === 'blue'){
      if (confirm(`Confirm you presence at '${clickInfo.event.title}'?`)) {
        this.eventService.respondToEventInvitation(Number(clickInfo.event.id),this.userId, 'accept');
        clickInfo.event.setProp('color', 'green');
      }
      else{
        this.eventService.respondToEventInvitation(Number(clickInfo.event.id),this.userId, 'decline');
        clickInfo.event.setProp('color', 'red');
      }
    }
    else{
      const title = prompt('Please enter a new description for your event');
      const calendarApi = clickInfo.view.calendar;
  
      calendarApi.unselect();
  
      if (title) {
        const startDate = clickInfo.event.start !== null ? clickInfo.event.start : new Date();
        const endDate = clickInfo.event.end !== null ? clickInfo.event.end : new Date();
        this.eventService.editEvent(Number(clickInfo.event.id), title, startDate, endDate);
        clickInfo.event.setProp('title', title);
      }
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges();
  }

  async getEvents(): Promise<EventInput[]> {
    const eventsRes = await this.eventService.getEventsByUserId(this.userId);
    const invitesRes = await this.userService.getInvitedEvents(this.userId);
  
    const events :EventInput[]  = eventsRes.map(event => {
      return {
        id: event.id.toString(),
        title: event.description ? event.description : '',
        start: event.startTime ? event.startTime : new Date(),
        end: event.endTime ? event.endTime : new Date(),
        color: 'green'
      };
    });

    const invites :EventInput[] = invitesRes.map(invite => {
      return {
        id: invite.event.id.toString(),
        title: invite.event.description ? invite.event.description : '',
        start: invite.event.startTime ? invite.event.startTime : new Date(),
        end: invite.event.endTime ? invite.event.endTime : new Date(),
        color: invite.status === 'pending' ? 'blue' : 
        invite.status === 'accepted' ? 'green' : 'red'
      };
    });

    return events.concat(invites);
  }
  

  async loadEvents() {
    const events = await this.getEvents();
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.addEventSource(events);
  }

  doRangesOverlap(range1: { start: Date | null, end: Date | null }, range2: { start: Date | null, end: Date | null }): boolean {

    if (range1.start === null || range1.end === null || range2.start === null || range2.end === null) {
      return false; 
    }
    return range1.start < range2.end && range2.start < range1.end;
  }
  
}
