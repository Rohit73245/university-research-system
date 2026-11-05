import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { FacultyInput, FacultyService } from './faculty';

describe('FacultyService', () => {
  let service: FacultyService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(FacultyService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('gets faculty records from JSON Server', () => {
    service.getFaculty().subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/faculty');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('adds a faculty member to JSON Server', () => {
    const faculty: FacultyInput = {
      name: 'Dr. New Faculty',
      department: 'Physics',
      designation: 'Lecturer'
    };

    service.addFaculty(faculty).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/faculty');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(faculty);
    request.flush({ ...faculty, id: 2 });
  });

  it('updates the selected faculty member on JSON Server', () => {
    const faculty: FacultyInput = {
      name: 'Dr. Amit Patil',
      department: 'Computer Science',
      designation: 'Associate Professor'
    };

    service.updateFaculty(1, faculty).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/faculty/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(faculty);
    request.flush({ ...faculty, id: 1 });
  });

  it('deletes the selected faculty member from JSON Server', () => {
    service.deleteFaculty(1).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/faculty/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
