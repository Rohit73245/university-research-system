
import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { ResearchProjects } from './components/research-projects/research-projects';
import { Laboratories } from './components/laboratories/laboratories';
import { Students } from './components/students/students';
import { Faculty } from './components/faculty/faculty';
import { EquipmentManagement } from './components/equipment/equipment';
import { Bookings } from './components/bookings/bookings';
import { Dashboard } from './components/dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Sidebar,
    Dashboard,
    ResearchProjects,
    Laboratories,
    Students,
    Faculty,
    EquipmentManagement,
    Bookings
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  activeModule:
    | 'research-projects'
    | 'laboratories'
    | 'students'
    | 'faculty'
    | 'equipment'
    | 'bookings'
    | 'dashboard' = 'dashboard';
}
