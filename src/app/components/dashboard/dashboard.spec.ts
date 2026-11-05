import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { BookingService } from '../../services/booking';
import { EquipmentService } from '../../services/equipment';
import { FacultyService } from '../../services/faculty';
import { LaboratoryService } from '../../services/laboratory';
import { ResearchService } from '../../services/research';
import { StudentService } from '../../services/student';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let services: {
    research: { getProjects: ReturnType<typeof vi.fn> };
    laboratories: { getLaboratories: ReturnType<typeof vi.fn> };
    students: { getStudents: ReturnType<typeof vi.fn> };
    faculty: { getFaculty: ReturnType<typeof vi.fn> };
    equipment: { getEquipment: ReturnType<typeof vi.fn> };
    bookings: { getBookings: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    services = {
      research: {
        getProjects: vi.fn(() => of([
          { id: 1, title: 'Project One', department: 'Biology', status: 'Ongoing' },
          { id: 2, title: 'Project Two', department: 'Physics', status: 'Completed' }
        ]))
      },
      laboratories: {
        getLaboratories: vi.fn(() => of([
          { id: 1, name: 'Lab One' },
          { id: 2, name: 'Lab Two' }
        ]))
      },
      students: {
        getStudents: vi.fn(() => of([{ id: 1 }, { id: 2 }, { id: 3 }]))
      },
      faculty: {
        getFaculty: vi.fn(() => of([{ id: 1 }]))
      },
      equipment: {
        getEquipment: vi.fn(() => of([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]))
      },
      bookings: {
        getBookings: vi.fn(() => of([
          {
            id: 1,
            laboratory: 'Lab One',
            student: 'Student One',
            date: '2026-11-10',
            status: 'Approved'
          }
        ]))
      }
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: ResearchService, useValue: services.research },
        { provide: LaboratoryService, useValue: services.laboratories },
        { provide: StudentService, useValue: services.students },
        { provide: FacultyService, useValue: services.faculty },
        { provide: EquipmentService, useValue: services.equipment },
        { provide: BookingService, useValue: services.bookings }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads live counts and recent projects and bookings', () => {
    fixture.detectChanges();

    expect(component.counts).toEqual({
      projects: 2,
      laboratories: 2,
      students: 3,
      faculty: 1,
      equipment: 4,
      bookings: 1
    });
    expect(component.recentProjects.map(project => project.title))
      .toEqual(['Project Two', 'Project One']);
    expect(component.recentBookings[0].student).toBe('Student One');

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Project Two');
    expect(text).toContain('Student One');
    expect(text).toContain('4');
  });

  it('continues displaying available data and reports an endpoint error', () => {
    services.equipment.getEquipment.mockReturnValue(
      throwError(() => new Error('Equipment endpoint unavailable'))
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    fixture.detectChanges();

    expect(component.counts['projects']).toBe(2);
    expect(component.counts['equipment']).toBeNull();
    expect(component.loadErrors).toContain('Equipment');
    expect(component.loading).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Unavailable');
    expect((fixture.nativeElement as HTMLElement).textContent)
      .toContain('Some dashboard data could not be loaded: Equipment');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Project Two');
  });
});
