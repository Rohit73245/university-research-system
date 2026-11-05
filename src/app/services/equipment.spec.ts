import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { EquipmentInput, EquipmentService } from './equipment';

describe('EquipmentService', () => {
  let service: EquipmentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EquipmentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('gets equipment from JSON Server', () => {
    service.getEquipment().subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/equipment');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('adds equipment to JSON Server', () => {
    const equipment: EquipmentInput = {
      name: 'Printer',
      quantity: 5,
      condition: 'New'
    };

    service.addEquipment(equipment).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/equipment');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(equipment);
    request.flush({ ...equipment, id: 3 });
  });

  it('updates the selected equipment on JSON Server', () => {
    const equipment: EquipmentInput = {
      name: 'Microscope',
      quantity: 12,
      condition: 'Excellent'
    };

    service.updateEquipment(1, equipment).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/equipment/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(equipment);
    request.flush({ ...equipment, id: 1 });
  });

  it('deletes the selected equipment from JSON Server', () => {
    service.deleteEquipment(2).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/equipment/2');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
