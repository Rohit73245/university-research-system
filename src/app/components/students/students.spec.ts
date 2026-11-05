import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AcademicYear, Student, StudentInput, StudentService } from '../../services/student';
import { Students } from './students';

describe('Students', () => {
  let component: Students;
  let fixture: ComponentFixture<Students>;
  let service: {
    getStudents: ReturnType<typeof vi.fn>;
    addStudent: ReturnType<typeof vi.fn>;
    updateStudent: ReturnType<typeof vi.fn>;
    deleteStudent: ReturnType<typeof vi.fn>;
  };
  let serverStudents: Student[];

  beforeEach(async () => {
    serverStudents = [
      { id: 1, name: 'Rahul Patil', department: 'Computer Science', year: 'Third Year' },
      { id: 2, name: 'Priya Sharma', department: 'Information Technology', year: 'Second Year' }
    ];

    service = {
      getStudents: vi.fn(() => of([...serverStudents])),
      addStudent: vi.fn((student: StudentInput) => {
        const addedStudent = { ...student, id: 3 };
        serverStudents.push(addedStudent);
        return of(addedStudent);
      }),
      updateStudent: vi.fn((id: number, student: StudentInput) => {
        serverStudents = serverStudents.map(existing =>
          existing.id === id ? { ...student, id } : existing
        );
        return of(serverStudents.find(existing => existing.id === id)!);
      }),
      deleteStudent: vi.fn((id: number) => {
        serverStudents = serverStudents.filter(student => student.id !== id);
        return of(undefined);
      })
    };

    await TestBed.configureTestingModule({
      imports: [Students],
      providers: [{ provide: StudentService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(Students);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and displays students returned by the service', () => {
    fixture.detectChanges();

    const tableText = (fixture.nativeElement as HTMLElement)
      .querySelector('tbody')
      ?.textContent;

    expect(tableText).toContain('Rahul Patil');
    expect(tableText).toContain('Priya Sharma');
    expect(service.getStudents).toHaveBeenCalled();
  });

  it('adds a student, refreshes the table, and resets the form', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.student = {
      name: 'New Student',
      department: 'Physics',
      year: 'First Year'
    };
    const newStudent = { ...component.student };

    component.saveStudent();

    expect(service.addStudent).toHaveBeenCalledWith(newStudent);
    expect(component.students.some(student => student.name === 'New Student')).toBe(true);
    expect(component.editingId).toBeNull();
    expect(component.student).toEqual({ name: '', department: '', year: '' });
  });

  it('loads the selected student into the form and updates the same record', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const selectedStudent = component.students[0];
    component.editStudent(selectedStudent);

    expect(component.student).toEqual({
      name: selectedStudent.name,
      department: selectedStudent.department,
      year: selectedStudent.year
    });
    expect(component.editingId).toBe(selectedStudent.id);

    component.student.department = 'Engineering';
    const updatedStudent = { ...component.student };
    component.saveStudent();

    expect(service.updateStudent).toHaveBeenCalledWith(selectedStudent.id, updatedStudent);
    expect(component.students).toHaveLength(2);
    expect(component.students.find(student => student.id === selectedStudent.id)?.department)
      .toBe('Engineering');
    expect(component.editingId).toBeNull();
  });

  it('deletes only after confirmation and refreshes the table', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.deleteStudent(1);

    expect(service.deleteStudent).toHaveBeenCalledWith(1);
    expect(component.students.some(student => student.id === 1)).toBe(false);
  });

  it('does not delete when confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteStudent(1);

    expect(service.deleteStudent).not.toHaveBeenCalled();
    expect(component.students).toHaveLength(2);
  });

  it('clears the form and exits edit mode', () => {
    component.editStudent(component.students[0]);
    component.resetForm();

    expect(component.editingId).toBeNull();
    expect(component.student).toEqual({ name: '', department: '', year: '' });
  });

  it('rejects whitespace-only student names and departments', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.student = {
      name: '   ',
      department: 'Computer Science',
      year: 'Third Year'
    };

    component.saveStudent();

    expect(service.addStudent).not.toHaveBeenCalled();

    component.student = {
      name: 'Valid Name',
      department: '   ',
      year: 'Third Year'
    };
    component.saveStudent();

    expect(service.addStudent).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledTimes(2);
  });

  it('rejects an academic year that is not in the available options', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.student = {
      name: 'Valid Name',
      department: 'Computer Science',
      year: 'Graduate Year' as AcademicYear
    };

    component.saveStudent();

    expect(service.addStudent).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('provides only the configured academic year options', () => {
    fixture.detectChanges();
    const options = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSelectElement>(
        'select[name="year"] option'
      )
    ).map(option => option.value);

    expect(options).toEqual([
      '',
      'First Year',
      'Second Year',
      'Third Year',
      'Fourth Year'
    ]);
  });
});
