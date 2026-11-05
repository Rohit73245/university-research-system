import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  @Input() activeModule:
    | 'research-projects'
    | 'laboratories'
    | 'students'
    | 'faculty'
    | 'equipment'
    | 'bookings'
    | 'dashboard' = 'dashboard';
  @Output() moduleSelected = new EventEmitter<
    | 'dashboard'
    | 'research-projects'
    | 'laboratories'
    | 'students'
    | 'faculty'
    | 'equipment'
    | 'bookings'
  >();
}
