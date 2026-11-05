import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { BookingInput, BookingService } from './booking';

describe('BookingService', () => {
  let service: BookingService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BookingService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('gets bookings from JSON Server', () => {
    service.getBookings().subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/bookings');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('adds a booking to JSON Server', () => {
    const booking: BookingInput = {
      laboratory: 'Computer Science Lab',
      student: 'Rahul Patil',
      date: '2026-11-10',
      status: 'Pending'
    };

    service.addBooking(booking).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/bookings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(booking);
    request.flush({ ...booking, id: 2 });
  });

  it('updates the selected booking on JSON Server', () => {
    const booking: BookingInput = {
      laboratory: 'Physics Lab',
      student: 'Priya Sharma',
      date: '2026-11-12',
      status: 'Approved'
    };

    service.updateBooking(1, booking).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/bookings/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(booking);
    request.flush({ ...booking, id: 1 });
  });

  it('deletes the selected booking from JSON Server', () => {
    service.deleteBooking(1).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/bookings/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
