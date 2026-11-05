import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ResearchService } from '../../services/research';
import { ResearchProjects } from './research-projects';

describe('ResearchProjects', () => {
  let component: ResearchProjects;
  let fixture: ComponentFixture<ResearchProjects>;
  let service: {
    getProjects: ReturnType<typeof vi.fn>;
    addProject: ReturnType<typeof vi.fn>;
    updateProject: ReturnType<typeof vi.fn>;
    deleteProject: ReturnType<typeof vi.fn>;
  };
  let serverProjects: {
    id: number;
    title: string;
    department: string;
    faculty: string;
    status: string;
  }[];

  beforeEach(async () => {
    serverProjects = [
      {
        id: 1,
        title: 'AI Based Healthcare System',
        department: 'Computer Science',
        faculty: 'Dr. Amit Patil',
        status: 'Ongoing'
      },
      {
        id: 2,
        title: 'Smart Agriculture Research',
        department: 'Information Technology',
        faculty: 'Dr. Sneha Sharma',
        status: 'Completed'
      }
    ];

    service = {
      getProjects: vi.fn(() => of([...serverProjects])),
      addProject: vi.fn(project => {
        serverProjects.push({ ...project, id: 3 });
        return of(serverProjects[serverProjects.length - 1]);
      }),
      updateProject: vi.fn((id, project) => {
        serverProjects = serverProjects.map(existing =>
          existing.id === id ? { ...project, id } : existing
        );
        return of(serverProjects.find(existing => existing.id === id));
      }),
      deleteProject: vi.fn(id => {
        serverProjects = serverProjects.filter(project => project.id !== id);
        return of(undefined);
      })
    };

    await TestBed.configureTestingModule({
      imports: [ResearchProjects],
      providers: [{ provide: ResearchService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(ResearchProjects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads and displays all projects returned by the service', () => {
    fixture.detectChanges();

    const tableText = (fixture.nativeElement as HTMLElement)
      .querySelector('tbody')
      ?.textContent;

    expect(tableText).toContain('AI Based Healthcare System');
    expect(tableText).toContain('Smart Agriculture Research');
    expect(service.getProjects).toHaveBeenCalled();
  });

  it('adds a project, refreshes the table, and resets the form', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.project = {
      title: 'New Project',
      department: 'Physics',
      faculty: 'Dr. New',
      status: 'Ongoing'
    };
    const newProject = { ...component.project };

    component.saveProject();

    expect(service.addProject).toHaveBeenCalledWith(newProject);
    expect(component.projects.some(project => project.title === 'New Project')).toBe(true);
    expect(component.editingId).toBeNull();
    expect(component.project.title).toBe('');
  });

  it('loads the selected project into the form and updates the same record', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const selectedProject = component.projects[0];
    component.editProject(selectedProject);

    expect(component.project).toEqual(selectedProject);
    expect(component.project).not.toBe(selectedProject);
    expect(component.editingId).toBe(selectedProject.id);

    component.project.title = 'Updated Healthcare Project';
    const updatedProject = { ...component.project };
    component.saveProject();

    expect(service.updateProject).toHaveBeenCalledWith(selectedProject.id, updatedProject);
    expect(component.projects).toHaveLength(2);
    expect(component.projects.find(project => project.id === selectedProject.id)?.title)
      .toBe('Updated Healthcare Project');
    expect(component.editingId).toBeNull();
  });

  it('deletes only after confirmation and refreshes the table', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.deleteProject(1);

    expect(service.deleteProject).toHaveBeenCalledWith(1);
    expect(component.projects.some(project => project.id === 1)).toBe(false);
  });

  it('does not delete when confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteProject(1);

    expect(service.deleteProject).not.toHaveBeenCalled();
    expect(component.projects).toHaveLength(2);
  });

  it('clears the form and exits edit mode', () => {
    component.editProject(component.projects[0]);
    component.resetForm();

    expect(component.editingId).toBeNull();
    expect(component.project).toEqual({
      title: '',
      department: '',
      faculty: '',
      status: 'Ongoing'
    });
  });

  it('rejects whitespace-only required fields', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.project = {
      title: '   ',
      department: 'Computer Science',
      faculty: 'Dr. Test',
      status: 'Ongoing'
    };

    component.saveProject();

    expect(service.addProject).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Please fill all fields');
  });

  it('offers only Ongoing and Completed statuses', () => {
    fixture.detectChanges();
    const options = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSelectElement>(
        'select[name="status"] option'
      )
    ).map(option => option.value);

    expect(options).toEqual(['Ongoing', 'Completed']);
  });
});
