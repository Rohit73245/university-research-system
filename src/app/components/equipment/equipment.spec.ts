import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Equipment, EquipmentInput, EquipmentService } from '../../services/equipment';
import { EquipmentManagement } from './equipment';

describe('EquipmentManagement', () => {
  let component: EquipmentManagement;
  let fixture: ComponentFixture<EquipmentManagement>;
  let service: {
    getEquipment: ReturnType<typeof vi.fn>;
    addEquipment: ReturnType<typeof vi.fn>;
    updateEquipment: ReturnType<typeof vi.fn>;
    deleteEquipment: ReturnType<typeof vi.fn>;
  };
  let serverEquipment: Equipment[];

  beforeEach(async () => {
    serverEquipment = [
      { id: 1, name: 'Microscope', quantity: 10, condition: 'Good' },
      { id: 2, name: 'Computer', quantity: 25, condition: 'Working' }
    ];

    service = {
      getEquipment: vi.fn(() => of([...serverEquipment])),
      addEquipment: vi.fn((equipment: EquipmentInput) => {
        const addedEquipment = { ...equipment, id: 3 };
        serverEquipment.push(addedEquipment);
        return of(addedEquipment);
      }),
      updateEquipment: vi.fn((id: number, equipment: EquipmentInput) => {
        serverEquipment = serverEquipment.map(existing =>
          existing.id === id ? { ...equipment, id } : existing
        );
        return of(serverEquipment.find(existing => existing.id === id)!);
      }),
      deleteEquipment: vi.fn((id: number) => {
        serverEquipment = serverEquipment.filter(equipment => equipment.id !== id);
        return of(undefined);
      })
    };

    await TestBed.configureTestingModule({
      imports: [EquipmentManagement],
      providers: [{ provide: EquipmentService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(EquipmentManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and displays equipment returned by the service', () => {
    fixture.detectChanges();

    const tableText = (fixture.nativeElement as HTMLElement)
      .querySelector('tbody')
      ?.textContent;

    expect(tableText).toContain('Microscope');
    expect(tableText).toContain('Computer');
    expect(tableText).toContain('Good');
    expect(tableText).toContain('Working');
    expect(service.getEquipment).toHaveBeenCalled();
  });

  it('adds equipment, refreshes the table, and resets the form', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.equipment = {
      name: 'Printer',
      quantity: 5,
      condition: 'New'
    };
    const newEquipment = { ...component.equipment };

    component.saveEquipment();

    expect(service.addEquipment).toHaveBeenCalledWith(newEquipment);
    expect(component.equipmentList.some(item => item.name === 'Printer')).toBe(true);
    expect(component.editingId).toBeNull();
    expect(component.equipment).toEqual({ name: '', quantity: 1, condition: '' });
  });

  it('loads the selected equipment into the form and updates the same record', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    const selectedEquipment = component.equipmentList[0];
    component.editEquipment(selectedEquipment);

    expect(component.equipment).toEqual({
      name: selectedEquipment.name,
      quantity: selectedEquipment.quantity,
      condition: selectedEquipment.condition
    });
    expect(component.editingId).toBe(selectedEquipment.id);

    component.equipment.condition = 'Excellent';
    const updatedEquipment = { ...component.equipment };
    component.saveEquipment();

    expect(service.updateEquipment).toHaveBeenCalledWith(
      selectedEquipment.id,
      updatedEquipment
    );
    expect(component.equipmentList).toHaveLength(2);
    expect(component.equipmentList[0].condition).toBe('Excellent');
    expect(component.editingId).toBeNull();
  });

  it('deletes only after confirmation and refreshes the table', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.deleteEquipment(1);

    expect(service.deleteEquipment).toHaveBeenCalledWith(1);
    expect(component.equipmentList.some(item => item.id === 1)).toBe(false);
  });

  it('does not delete when confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteEquipment(1);

    expect(service.deleteEquipment).not.toHaveBeenCalled();
    expect(component.equipmentList).toHaveLength(2);
  });

  it('clears the form and exits edit mode', () => {
    component.editEquipment(component.equipmentList[0]);
    component.resetForm();

    expect(component.editingId).toBeNull();
    expect(component.equipment).toEqual({ name: '', quantity: 1, condition: '' });
  });

  it('rejects whitespace-only name and condition', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.equipment = { name: '  ', quantity: 2, condition: 'Good' };
    component.saveEquipment();
    component.equipment = { name: 'Microscope', quantity: 2, condition: '  ' };
    component.saveEquipment();

    expect(service.addEquipment).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledTimes(2);
  });

  it('rejects a non-positive or fractional quantity', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.equipment = { name: 'Microscope', quantity: 0, condition: 'Good' };
    component.saveEquipment();
    component.equipment = { name: 'Microscope', quantity: 1.5, condition: 'Good' };
    component.saveEquipment();

    expect(service.addEquipment).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledTimes(2);
  });
});
