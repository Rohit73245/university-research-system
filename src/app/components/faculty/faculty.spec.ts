import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { FacultyInput, FacultyMember, FacultyService } from '../../services/faculty';
import { Faculty } from './faculty';

describe('Faculty', () => {
  let component: Faculty;
  let fixture: ComponentFixture<Faculty>;
  let service: {
    getFaculty: ReturnType<typeof vi.fn>;
    addFaculty: ReturnType<typeof vi.fn>;
    updateFaculty: ReturnType<typeof vi.fn>;
    deleteFaculty: ReturnType<typeof vi.fn>;
  };
  let serverFaculty: FacultyMember[];

  beforeEach(async () => {
    serverFaculty = [
      {
        id: 1,
        name: 'Dr. Amit Patil',
        department: 'Computer Science',
        designation: 'Professor'
      }
    ];

    service = {
      getFaculty: vi.fn(() => of([...serverFaculty])),
      addFaculty: vi.fn((faculty: FacultyInput) => {
        const addedFaculty = { ...faculty, id: 2 };
        serverFaculty.push(addedFaculty);
        return of(addedFaculty);
      }),
      updateFaculty: vi.fn((id: number, faculty: FacultyInput) => {
        serverFaculty = serverFaculty.map(existing =>
          existing.id === id ? { ...faculty, id } : existing
        );
        return of(serverFaculty.find(existing => existing.id === id)!);
      }),
      deleteFaculty: vi.fn((id: number) => {
        serverFaculty = serverFaculty.filter(faculty => faculty.id !== id);
        return of(undefined);
      })
    };

    await TestBed.configureTestingModule({
      imports: [Faculty],
      providers: [{ provide: FacultyService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(Faculty);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and displays faculty records from the service', () => {
    fixture.detectChanges();

    const tableText = (fixture.nativeElement as HTMLElement)
      .querySelector('tbody')
      ?.textContent;

    expect(tableText).toContain('Dr. Amit Patil');
    expect(tableText).toContain('Computer Science');
    expect(tableText).toContain('Professor');
    expect(service.getFaculty).toHaveBeenCalled();
  });

  it('adds a faculty member, refreshes the table, and resets the form', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.faculty = {
      name: 'Dr. New Faculty',
      department: 'Physics',
      designation: 'Lecturer'
    };
    const newFaculty = { ...component.faculty };

    component.saveFaculty();

    expect(service.addFaculty).toHaveBeenCalledWith(newFaculty);
    expect(component.facultyMembers.some(member => member.name === 'Dr. New Faculty'))
      .toBe(true);
    expect(component.editingId).toBeNull();
    expect(component.faculty).toEqual({ name: '', department: '', designation: '' });
  });

  it('loads the selected record into the form and updates the same record', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const selectedFaculty = component.facultyMembers[0];
    component.editFaculty(selectedFaculty);

    expect(component.faculty).toEqual({
      name: selectedFaculty.name,
      department: selectedFaculty.department,
      designation: selectedFaculty.designation
    });
    expect(component.editingId).toBe(selectedFaculty.id);

    component.faculty.designation = 'Associate Professor';
    const updatedFaculty = { ...component.faculty };
    component.saveFaculty();

    expect(service.updateFaculty).toHaveBeenCalledWith(selectedFaculty.id, updatedFaculty);
    expect(component.facultyMembers).toHaveLength(1);
    expect(component.facultyMembers[0].designation).toBe('Associate Professor');
    expect(component.editingId).toBeNull();
  });

  it('deletes only after confirmation and refreshes the table', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.deleteFaculty(1);

    expect(service.deleteFaculty).toHaveBeenCalledWith(1);
    expect(component.facultyMembers).toHaveLength(0);
  });

  it('does not delete when confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteFaculty(1);

    expect(service.deleteFaculty).not.toHaveBeenCalled();
    expect(component.facultyMembers).toHaveLength(1);
  });

  it('clears the form and exits edit mode', () => {
    component.editFaculty(component.facultyMembers[0]);
    component.resetForm();

    expect(component.editingId).toBeNull();
    expect(component.faculty).toEqual({ name: '', department: '', designation: '' });
  });

  it('rejects empty or whitespace-only name, department, and designation', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const validFaculty: FacultyInput = {
      name: 'Dr. Faculty',
      department: 'Computer Science',
      designation: 'Professor'
    };

    component.faculty = { ...validFaculty, name: '   ' };
    component.saveFaculty();
    component.faculty = { ...validFaculty, department: '   ' };
    component.saveFaculty();
    component.faculty = { ...validFaculty, designation: '   ' };
    component.saveFaculty();

    expect(service.addFaculty).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledTimes(3);
  });
});
