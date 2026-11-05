import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FacultyInput, FacultyMember, FacultyService } from '../../services/faculty';

@Component({
  selector: 'app-faculty',
  imports: [FormsModule],
  templateUrl: './faculty.html',
  styleUrl: './faculty.css'
})
export class Faculty implements OnInit {
  facultyMembers: FacultyMember[] = [];

  faculty: FacultyInput = this.emptyFaculty();

  editingId: number | null = null;

  constructor(
    private facultyService: FacultyService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFaculty();
  }

  loadFaculty(): void {
    this.facultyService.getFaculty().subscribe(facultyMembers => {
      this.facultyMembers = facultyMembers;
      this.changeDetectorRef.markForCheck();
    });
  }

  saveFaculty(): void {
    const name = this.faculty.name.trim();
    const department = this.faculty.department.trim();
    const designation = this.faculty.designation.trim();

    if (!name || !department || !designation) {
      alert('Enter a faculty name, department, and designation.');
      return;
    }

    const faculty: FacultyInput = { name, department, designation };

    if (this.editingId !== null) {
      this.facultyService.updateFaculty(this.editingId, faculty).subscribe(() => {
        alert('Faculty updated successfully!');
        this.loadFaculty();
        this.resetForm();
      });
      return;
    }

    this.facultyService.addFaculty(faculty).subscribe(() => {
      alert('Faculty added successfully!');
      this.loadFaculty();
      this.resetForm();
    });
  }

  editFaculty(faculty: FacultyMember): void {
    this.faculty = {
      name: faculty.name,
      department: faculty.department,
      designation: faculty.designation
    };
    this.editingId = faculty.id;
  }

  deleteFaculty(id: number): void {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      this.facultyService.deleteFaculty(id).subscribe(() => {
        alert('Faculty deleted successfully!');
        this.loadFaculty();
      });
    }
  }

  resetForm(): void {
    this.faculty = this.emptyFaculty();
    this.editingId = null;
  }

  private emptyFaculty(): FacultyInput {
    return {
      name: '',
      department: '',
      designation: ''
    };
  }
}
