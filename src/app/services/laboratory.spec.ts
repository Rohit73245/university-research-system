import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { LaboratoryInput, LaboratoryService } from './laboratory';

describe('LaboratoryService', () => {
  let service: LaboratoryService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LaboratoryService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('gets laboratories from JSON Server', () => {
    service.getLaboratories().subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/laboratories');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('adds a laboratory to JSON Server', () => {
    const laboratory: LaboratoryInput = {
      name: 'Chemistry Lab',
      location: 'Block C',
      capacity: 24,
      status: 'Available'
    };

    service.addLaboratory(laboratory).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/laboratories');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(laboratory);
    request.flush({ ...laboratory, id: 3 });
  });

  it('updates the selected laboratory on JSON Server', () => {
    const laboratory: LaboratoryInput = {
      name: 'Updated Lab',
      location: 'Block D',
      capacity: 32,
      status: 'Occupied'
    };

    service.updateLaboratory(2, laboratory).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/laboratories/2');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(laboratory);
    request.flush({ ...laboratory, id: 2 });
  });

  it('deletes the selected laboratory from JSON Server', () => {
    service.deleteLaboratory(2).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/laboratories/2');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
