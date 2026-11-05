import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BookingService } from './services/booking';
import { EquipmentService } from './services/equipment';
import { FacultyService } from './services/faculty';
import { LaboratoryService } from './services/laboratory';
import { ResearchService } from './services/research';
import { StudentService } from './services/student';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ResearchService, useValue: { getProjects: () => of([]) } },
        { provide: LaboratoryService, useValue: { getLaboratories: () => of([]) } },
        { provide: StudentService, useValue: { getStudents: () => of([]) } },
        { provide: FacultyService, useValue: { getFaculty: () => of([]) } },
        { provide: EquipmentService, useValue: { getEquipment: () => of([]) } },
        { provide: BookingService, useValue: { getBookings: () => of([]) } }
      ]
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the live dashboard by default', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-dashboard h2')?.textContent).toContain('Dashboard');
    expect(compiled.querySelector('.sidebar .menu-item.active')?.textContent).toContain('Dashboard');
  });

  it('navigates to all six management modules from the sidebar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const destinations = [
      { buttonIndex: 1, selector: 'app-research-projects' },
      { buttonIndex: 2, selector: 'app-laboratories' },
      { buttonIndex: 3, selector: 'app-students' },
      { buttonIndex: 4, selector: 'app-faculty' },
      { buttonIndex: 5, selector: 'app-equipment' },
      { buttonIndex: 6, selector: 'app-bookings' }
    ];

    for (const destination of destinations) {
      const buttons = (fixture.nativeElement as HTMLElement)
        .querySelectorAll<HTMLButtonElement>('app-sidebar button');
      buttons.item(destination.buttonIndex).click();
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).querySelector(destination.selector))
        .not.toBeNull();
    }
  });
});
