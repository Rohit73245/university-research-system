import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selects and highlights the Dashboard module', () => {
    const moduleSelected = vi.spyOn(component.moduleSelected, 'emit');
    const dashboardButton = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')
      .item(0);

    dashboardButton.click();
    component.activeModule = 'dashboard';
    fixture.detectChanges();

    expect(moduleSelected).toHaveBeenCalledWith('dashboard');
    expect(dashboardButton.classList).toContain('active');
  });

  it('selects and highlights the Research Projects module', () => {
    const moduleSelected = vi.spyOn(component.moduleSelected, 'emit');
    const researchButton = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')
      .item(1);

    researchButton.click();
    component.activeModule = 'research-projects';
    fixture.detectChanges();

    expect(moduleSelected).toHaveBeenCalledWith('research-projects');
    expect(researchButton.classList).toContain('active');
  });

  it('selects and highlights the Laboratories module', () => {
    const moduleSelected = vi.spyOn(component.moduleSelected, 'emit');
    const laboratoriesButton = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')
      .item(2);

    laboratoriesButton.click();
    component.activeModule = 'laboratories';
    fixture.detectChanges();

    expect(moduleSelected).toHaveBeenCalledWith('laboratories');
    expect(laboratoriesButton.classList).toContain('active');
  });

  it('selects and highlights the Students module', () => {
    const moduleSelected = vi.spyOn(component.moduleSelected, 'emit');
    const studentsButton = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')
      .item(3);

    studentsButton.click();
    component.activeModule = 'students';
    fixture.detectChanges();

    expect(moduleSelected).toHaveBeenCalledWith('students');
    expect(studentsButton.classList).toContain('active');
  });

  it('selects and highlights the Faculty module', () => {
    const moduleSelected = vi.spyOn(component.moduleSelected, 'emit');
    const facultyButton = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')
      .item(4);

    facultyButton.click();
    component.activeModule = 'faculty';
    fixture.detectChanges();

    expect(moduleSelected).toHaveBeenCalledWith('faculty');
    expect(facultyButton.classList).toContain('active');
  });

  it('selects and highlights the Equipment module', () => {
    const moduleSelected = vi.spyOn(component.moduleSelected, 'emit');
    const equipmentButton = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')
      .item(5);

    equipmentButton.click();
    component.activeModule = 'equipment';
    fixture.detectChanges();

    expect(moduleSelected).toHaveBeenCalledWith('equipment');
    expect(equipmentButton.classList).toContain('active');
  });

  it('selects and highlights the Lab Bookings module', () => {
    const moduleSelected = vi.spyOn(component.moduleSelected, 'emit');
    const bookingsButton = (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')
      .item(6);

    bookingsButton.click();
    component.activeModule = 'bookings';
    fixture.detectChanges();

    expect(moduleSelected).toHaveBeenCalledWith('bookings');
    expect(bookingsButton.classList).toContain('active');
  });
});
