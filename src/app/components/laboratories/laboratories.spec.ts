import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Laboratory, LaboratoryInput, LaboratoryService } from '../../services/laboratory';
import { Laboratories } from './laboratories';

describe('Laboratories', () => {
  let component: Laboratories;
  let fixture: ComponentFixture<Laboratories>;
  let service: {
    getLaboratories: ReturnType<typeof vi.fn>;
    addLaboratory: ReturnType<typeof vi.fn>;
    updateLaboratory: ReturnType<typeof vi.fn>;
    deleteLaboratory: ReturnType<typeof vi.fn>;
  };
  let serverLaboratories: Laboratory[];

  beforeEach(async () => {
    serverLaboratories = [
      {
        id: 1,
        name: 'Computer Science Lab',
        location: 'Block A',
        capacity: 40,
        status: 'Available'
      },
      {
        id: 2,
        name: 'Physics Lab',
        location: 'Block B',
        capacity: 30,
        status: 'Occupied'
      }
    ];

    service = {
      getLaboratories: vi.fn(() => of([...serverLaboratories])),
      addLaboratory: vi.fn((laboratory: LaboratoryInput) => {
        const addedLaboratory = { ...laboratory, id: 3 };
        serverLaboratories.push(addedLaboratory);
        return of(addedLaboratory);
      }),
      updateLaboratory: vi.fn((id: number, laboratory: LaboratoryInput) => {
        serverLaboratories = serverLaboratories.map(existing =>
          existing.id === id ? { ...laboratory, id } : existing
        );
        return of(serverLaboratories.find(existing => existing.id === id)!);
      }),
      deleteLaboratory: vi.fn((id: number) => {
        serverLaboratories = serverLaboratories.filter(laboratory => laboratory.id !== id);
        return of(undefined);
      })
    };

    await TestBed.configureTestingModule({
      imports: [Laboratories],
      providers: [{ provide: LaboratoryService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(Laboratories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and displays laboratories returned by the service', () => {
    fixture.detectChanges();

    const tableText = (fixture.nativeElement as HTMLElement)
      .querySelector('tbody')
      ?.textContent;

    expect(tableText).toContain('Computer Science Lab');
    expect(tableText).toContain('Physics Lab');
    expect(service.getLaboratories).toHaveBeenCalled();
  });

  it('adds a laboratory, refreshes the table, and resets the form', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.laboratory = {
      name: 'Chemistry Lab',
      location: 'Block C',
      capacity: 24,
      status: 'Available'
    };
    const newLaboratory = { ...component.laboratory };

    component.saveLaboratory();

    expect(service.addLaboratory).toHaveBeenCalledWith(newLaboratory);
    expect(component.laboratories.some(laboratory => laboratory.name === 'Chemistry Lab'))
      .toBe(true);
    expect(component.editingId).toBeNull();
    expect(component.laboratory.name).toBe('');
  });

  it('loads the selected laboratory into the form and updates the same record', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const selectedLaboratory = component.laboratories[0];
    component.editLaboratory(selectedLaboratory);

    expect(component.laboratory).toEqual({
      name: selectedLaboratory.name,
      location: selectedLaboratory.location,
      capacity: selectedLaboratory.capacity,
      status: selectedLaboratory.status
    });
    expect(component.editingId).toBe(selectedLaboratory.id);

    component.laboratory.location = 'Block D';
    const updatedLaboratory = { ...component.laboratory };
    component.saveLaboratory();

    expect(service.updateLaboratory).toHaveBeenCalledWith(
      selectedLaboratory.id,
      updatedLaboratory
    );
    expect(component.laboratories).toHaveLength(2);
    expect(component.laboratories.find(laboratory => laboratory.id === selectedLaboratory.id)
      ?.location).toBe('Block D');
    expect(component.editingId).toBeNull();
  });

  it('deletes only after confirmation and refreshes the table', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.deleteLaboratory(1);

    expect(service.deleteLaboratory).toHaveBeenCalledWith(1);
    expect(component.laboratories.some(laboratory => laboratory.id === 1)).toBe(false);
  });

  it('does not delete when confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteLaboratory(1);

    expect(service.deleteLaboratory).not.toHaveBeenCalled();
    expect(component.laboratories).toHaveLength(2);
  });

  it('clears the form and exits edit mode', () => {
    component.editLaboratory(component.laboratories[0]);
    component.resetForm();

    expect(component.editingId).toBeNull();
    expect(component.laboratory).toEqual({
      name: '',
      location: '',
      capacity: 1,
      status: 'Available'
    });
  });

  it('rejects empty or whitespace-only required text fields', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.laboratory = {
      name: '  ',
      location: 'Block A',
      capacity: 10,
      status: 'Available'
    };

    component.saveLaboratory();

    expect(service.addLaboratory).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('rejects a non-positive or fractional capacity', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.laboratory = {
      name: 'Chemistry Lab',
      location: 'Block C',
      capacity: 0.5,
      status: 'Available'
    };

    component.saveLaboratory();

    expect(service.addLaboratory).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('offers only Available and Occupied statuses', () => {
    fixture.detectChanges();
    const options = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLSelectElement>(
        'select[name="status"] option'
      )
    ).map(option => option.value);

    expect(options).toEqual(['Available', 'Occupied']);
  });
});
