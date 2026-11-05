import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicYear, Student, StudentInput, StudentService } from '../../services/student';

type StudentForm = Omit<StudentInput, 'year'> & { year: AcademicYear | '' };

@Component({
  selector: 'app-students',
  imports: [FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css'
})
export class Students implements OnInit {
  readonly academicYears: AcademicYear[] = [
    'First Year',
    'Second Year',
    'Third Year',
    'Fourth Year'
  ];

  students: Student[] = [];
  student: StudentForm = this.emptyStudent();
  editingId: number | null = null;

  constructor(
    private studentService: StudentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe(students => {
      this.students = students;
      this.changeDetectorRef.markForCheck();
    });
  }

  saveStudent(): void {
    const name = this.student.name.trim();
    const department = this.student.department.trim();

    if (!name || !department || !this.isAcademicYear(this.student.year)) {
      alert('Enter a student name and department, and select an academic year.');
      return;
    }

    const student: StudentInput = {
      name,
      department,
      year: this.student.year
    };

    if (this.editingId !== null) {
      this.studentService.updateStudent(this.editingId, student).subscribe(() => {
        alert('Student updated successfully!');
        this.loadStudents();
        this.resetForm();
      });
      return;
    }

    this.studentService.addStudent(student).subscribe(() => {
      alert('Student added successfully!');
      this.loadStudents();
      this.resetForm();
    });
  }

  editStudent(student: Student): void {
    this.student = {
      name: student.name,
      department: student.department,
      year: student.year
    };
    this.editingId = student.id;
  }

  deleteStudent(id: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id).subscribe(() => {
        alert('Student deleted successfully!');
        this.loadStudents();
      });
    }
  }

  resetForm(): void {
    this.student = this.emptyStudent();
    this.editingId = null;
  }

  private emptyStudent(): StudentForm {
    return {
      name: '',
      department: '',
      year: ''
    };
  }

  private isAcademicYear(year: string): year is AcademicYear {
    return year === 'First Year'
      || year === 'Second Year'
      || year === 'Third Year'
      || year === 'Fourth Year';
  }
}
