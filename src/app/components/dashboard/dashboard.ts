import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking, BookingService } from '../../services/booking';
import { EquipmentService } from '../../services/equipment';
import { FacultyService } from '../../services/faculty';
import { LaboratoryService } from '../../services/laboratory';
import { ResearchService } from '../../services/research';
import { StudentService } from '../../services/student';

interface ResearchProjectSummary {
  id: number;
  title: string;
  department: string;
  status: string;
}

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  loading = true;
  loadErrors: string[] = [];

  counts: Record<string, number | null> = {
    projects: null,
    laboratories: null,
    students: null,
    faculty: null,
    equipment: null,
    bookings: null
  };

  recentProjects: ResearchProjectSummary[] = [];
  recentBookings: Booking[] = [];

  constructor(
    private researchService: ResearchService,
    private laboratoryService: LaboratoryService,
    private studentService: StudentService,
    private facultyService: FacultyService,
    private equipmentService: EquipmentService,
    private bookingService: BookingService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.loadErrors = [];

    forkJoin({
      projects: this.loadCollection('Research projects', this.researchService.getProjects()),
      laboratories: this.loadCollection(
        'Laboratories',
        this.laboratoryService.getLaboratories()
      ),
      students: this.loadCollection('Students', this.studentService.getStudents()),
      faculty: this.loadCollection('Faculty', this.facultyService.getFaculty()),
      equipment: this.loadCollection('Equipment', this.equipmentService.getEquipment()),
      bookings: this.loadCollection('Lab bookings', this.bookingService.getBookings())
    }).subscribe(({ projects, laboratories, students, faculty, equipment, bookings }) => {
      this.counts = {
        projects: projects?.length ?? null,
        laboratories: laboratories?.length ?? null,
        students: students?.length ?? null,
        faculty: faculty?.length ?? null,
        equipment: equipment?.length ?? null,
        bookings: bookings?.length ?? null
      };
      this.recentProjects = projects?.slice(-5).reverse() ?? [];
      this.recentBookings = bookings?.slice(-5).reverse() ?? [];
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  private loadCollection<T>(
    label: string,
    request: Observable<T[]>
  ): Observable<T[] | null> {
    return request.pipe(
      catchError(error => {
        console.error(`Failed to load ${label.toLowerCase()} for the dashboard.`, error);
        this.loadErrors.push(label);
        return of(null);
      })
    );
  }
}
