import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { ResearchService } from './research';

describe('ResearchService', () => {
  let service: ResearchService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ResearchService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets projects from JSON Server', () => {
    service.getProjects().subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/projects');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('adds a project to JSON Server', () => {
    const project = {
      title: 'New Project',
      department: 'Physics',
      faculty: 'Dr. New',
      status: 'Ongoing'
    };

    service.addProject(project).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/projects');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(project);
    request.flush({ ...project, id: 3 });
  });

  it('updates the selected project on JSON Server', () => {
    const project = {
      title: 'Updated Project',
      department: 'Physics',
      faculty: 'Dr. New',
      status: 'Completed'
    };

    service.updateProject(2, project).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/projects/2');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(project);
    request.flush({ ...project, id: 2 });
  });

  it('deletes the selected project from JSON Server', () => {
    service.deleteProject(2).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/projects/2');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
