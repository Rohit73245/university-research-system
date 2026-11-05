import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Booking, BookingInput, BookingStatus, BookingService } from '../../services/booking';
import { Laboratory, LaboratoryService } from '../../services/laboratory';
import { Student, StudentService } from '../../services/student';

type BookingForm = Omit<BookingInput, 'status'> & { status: BookingStatus | '' };

@Component({
  selector: 'app-bookings',
  imports: [FormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
  readonly statuses: BookingStatus[] = ['Pending', 'Approved', 'Rejected'];
  readonly minDate = this.formatDate(new Date());

  bookings: Booking[] = [];
  laboratories: Laboratory[] = [];
  students: Student[] = [];
  booking: BookingForm = this.emptyBooking();
  editingId: number | null = null;

  constructor(
    private bookingService: BookingService,
    private laboratoryService: LaboratoryService,
    private studentService: StudentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadLaboratories();
    this.loadStudents();
  }

  loadBookings(): void {
    this.bookingService.getBookings().subscribe(bookings => {
      this.bookings = bookings;
      this.changeDetectorRef.markForCheck();
    });
  }

  loadLaboratories(): void {
    this.laboratoryService.getLaboratories().subscribe(laboratories => {
      this.laboratories = laboratories;
      this.changeDetectorRef.markForCheck();
    });
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe(students => {
      this.students = students;
      this.changeDetectorRef.markForCheck();
    });
  }

  saveBooking(): void {
    if (
      !this.laboratories.some(laboratory => laboratory.name === this.booking.laboratory)
      || !this.students.some(student => student.name === this.booking.student)
      || !this.booking.date
      || this.booking.date < this.minDate
      || !this.isBookingStatus(this.booking.status)
    ) {
      alert('Select a laboratory, student, valid date, and booking status.');
      return;
    }

    const booking: BookingInput = {
      laboratory: this.booking.laboratory,
      student: this.booking.student,
      date: this.booking.date,
      status: this.booking.status
    };

    if (this.editingId !== null) {
      this.bookingService.updateBooking(this.editingId, booking).subscribe(() => {
        alert('Booking updated successfully!');
        this.loadBookings();
        this.resetForm();
      });
      return;
    }

    this.bookingService.addBooking(booking).subscribe(() => {
      alert('Booking added successfully!');
      this.loadBookings();
      this.resetForm();
    });
  }

  editBooking(booking: Booking): void {
    this.booking = {
      laboratory: booking.laboratory,
      student: booking.student,
      date: booking.date,
      status: booking.status
    };
    this.editingId = booking.id;
  }

  deleteBooking(id: number): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.bookingService.deleteBooking(id).subscribe(() => {
        alert('Booking deleted successfully!');
        this.loadBookings();
      });
    }
  }

  resetForm(): void {
    this.booking = this.emptyBooking();
    this.editingId = null;
  }

  private emptyBooking(): BookingForm {
    return {
      laboratory: '',
      student: '',
      date: '',
      status: 'Pending'
    };
  }

  private isBookingStatus(status: string): status is BookingStatus {
    return this.statuses.some(option => option === status);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
