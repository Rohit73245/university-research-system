import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { StudentInput, StudentService } from './student';

describe('StudentService', () => {
  let service: StudentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StudentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('gets students from JSON Server', () => {
    service.getStudents().subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/students');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('adds a student to JSON Server', () => {
    const student: StudentInput = {
      name: 'New Student',
      department: 'Physics',
      year: 'First Year'
    };

    service.addStudent(student).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/students');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(student);
    request.flush({ ...student, id: 3 });
  });

  it('updates the selected student on JSON Server', () => {
    const student: StudentInput = {
      name: 'Updated Student',
      department: 'Engineering',
      year: 'Fourth Year'
    };

    service.updateStudent(2, student).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/students/2');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(student);
    request.flush({ ...student, id: 2 });
  });

  it('deletes the selected student from JSON Server', () => {
    service.deleteStudent(2).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/students/2');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
