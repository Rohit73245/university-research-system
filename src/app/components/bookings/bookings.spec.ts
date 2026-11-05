import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Booking, BookingInput, BookingService } from '../../services/booking';
import { Laboratory, LaboratoryService } from '../../services/laboratory';
import { Student, StudentService } from '../../services/student';
import { Bookings } from './bookings';

describe('Bookings', () => {
  let component: Bookings;
  let fixture: ComponentFixture<Bookings>;
  let bookingService: {
    getBookings: ReturnType<typeof vi.fn>;
    addBooking: ReturnType<typeof vi.fn>;
    updateBooking: ReturnType<typeof vi.fn>;
    deleteBooking: ReturnType<typeof vi.fn>;
  };
  let serverBookings: Booking[];

  const laboratories: Laboratory[] = [
    { id: 1, name: 'Computer Science Lab', location: 'Block A', capacity: 40, status: 'Available' },
    { id: 2, name: 'Physics Lab', location: 'Block B', capacity: 30, status: 'Occupied' }
  ];

  const students: Student[] = [
    { id: 1, name: 'Rahul Patil', department: 'Computer Science', year: 'Third Year' },
    { id: 2, name: 'Priya Sharma', department: 'Information Technology', year: 'Second Year' }
  ];

  beforeEach(async () => {
    serverBookings = [
      {
        id: 1,
        laboratory: 'Computer Science Lab',
        student: 'Rahul Patil',
        date: '2026-11-10',
        status: 'Approved'
      }
    ];

    bookingService = {
      getBookings: vi.fn(() => of([...serverBookings])),
      addBooking: vi.fn((booking: BookingInput) => {
        const addedBooking = { ...booking, id: 2 };
        serverBookings.push(addedBooking);
        return of(addedBooking);
      }),
      updateBooking: vi.fn((id: number, booking: BookingInput) => {
        serverBookings = serverBookings.map(existing =>
          existing.id === id ? { ...booking, id } : existing
        );
        return of(serverBookings.find(existing => existing.id === id)!);
      }),
      deleteBooking: vi.fn((id: number) => {
        serverBookings = serverBookings.filter(booking => booking.id !== id);
        return of(undefined);
      })
    };

    await TestBed.configureTestingModule({
      imports: [Bookings],
      providers: [
        { provide: BookingService, useValue: bookingService },
        { provide: LaboratoryService, useValue: { getLaboratories: () => of(laboratories) } },
        { provide: StudentService, useValue: { getStudents: () => of(students) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Bookings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads bookings and dropdown options from their services', () => {
    fixture.detectChanges();

    const tableText = (fixture.nativeElement as HTMLElement)
      .querySelector('tbody')
      ?.textContent;
    const laboratoryOptions = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSelectElement>(
        'select[name="laboratory"] option'
      )
    ).map(option => option.value);
    const studentOptions = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSelectElement>(
        'select[name="student"] option'
      )
    ).map(option => option.value);

    expect(tableText).toContain('Computer Science Lab');
    expect(tableText).toContain('Rahul Patil');
    expect(tableText).toContain('Approved');
    expect(laboratoryOptions).toContain('Physics Lab');
    expect(studentOptions).toContain('Priya Sharma');
    expect(bookingService.getBookings).toHaveBeenCalled();
  });

  it('adds a booking and refreshes the table', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.booking = {
      laboratory: 'Physics Lab',
      student: 'Priya Sharma',
      date: component.minDate,
      status: 'Pending'
    };
    const newBooking = { ...component.booking };

    component.saveBooking();

    expect(bookingService.addBooking).toHaveBeenCalledWith(newBooking);
    expect(component.bookings).toHaveLength(2);
    expect(component.bookings[1]).toMatchObject(newBooking);
    expect(component.editingId).toBeNull();
    expect(component.booking).toEqual({
      laboratory: '',
      student: '',
      date: '',
      status: 'Pending'
    });
  });

  it('populates the form and updates the same booking', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const selectedBooking = component.bookings[0];
    component.editBooking(selectedBooking);

    expect(component.booking).toEqual({
      laboratory: selectedBooking.laboratory,
      student: selectedBooking.student,
      date: selectedBooking.date,
      status: selectedBooking.status
    });
    expect(component.editingId).toBe(selectedBooking.id);

    component.booking.status = 'Rejected';
    const updatedBooking = { ...component.booking };
    component.saveBooking();

    expect(bookingService.updateBooking).toHaveBeenCalledWith(
      selectedBooking.id,
      updatedBooking
    );
    expect(component.bookings).toHaveLength(1);
    expect(component.bookings[0].status).toBe('Rejected');
    expect(component.editingId).toBeNull();
  });

  it('deletes only after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.deleteBooking(1);

    expect(bookingService.deleteBooking).toHaveBeenCalledWith(1);
    expect(component.bookings).toHaveLength(0);
  });

  it('does not delete if confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteBooking(1);

    expect(bookingService.deleteBooking).not.toHaveBeenCalled();
    expect(component.bookings).toHaveLength(1);
  });

  it('clears the form and exits edit mode', () => {
    component.editBooking(component.bookings[0]);
    component.resetForm();

    expect(component.editingId).toBeNull();
    expect(component.booking).toEqual({
      laboratory: '',
      student: '',
      date: '',
      status: 'Pending'
    });
  });

  it('rejects dropdown values not loaded from the APIs', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.booking = {
      laboratory: 'Unknown Lab',
      student: 'Rahul Patil',
      date: component.minDate,
      status: 'Pending'
    };
    component.saveBooking();

    expect(bookingService.addBooking).not.toHaveBeenCalled();

    component.booking = {
      laboratory: 'Computer Science Lab',
      student: 'Unknown Student',
      date: component.minDate,
      status: 'Pending'
    };
    component.saveBooking();

    expect(bookingService.addBooking).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledTimes(2);
  });

  it('rejects missing and past booking dates', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.booking = {
      laboratory: 'Computer Science Lab',
      student: 'Rahul Patil',
      date: '',
      status: 'Pending'
    };
    component.saveBooking();

    component.booking.date = '2000-01-01';
    component.saveBooking();

    expect(bookingService.addBooking).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledTimes(2);
  });

  it('rejects a status outside the allowed values', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.booking = {
      laboratory: 'Computer Science Lab',
      student: 'Rahul Patil',
      date: component.minDate,
      status: 'Cancelled' as Booking['status']
    };

    component.saveBooking();

    expect(bookingService.addBooking).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('shows all allowed booking statuses in the form', () => {
    fixture.detectChanges();
    const options = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSelectElement>(
        'select[name="status"] option'
      )
    ).map(option => option.value);

    expect(options).toEqual(['Pending', 'Approved', 'Rejected']);
  });
});
