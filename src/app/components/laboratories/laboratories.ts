import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Laboratory, LaboratoryInput, LaboratoryService } from '../../services/laboratory';

@Component({
  selector: 'app-laboratories',
  imports: [FormsModule],
  templateUrl: './laboratories.html',
  styleUrl: './laboratories.css'
})
export class Laboratories implements OnInit {
  laboratories: Laboratory[] = [];

  laboratory: LaboratoryInput = this.emptyLaboratory();

  editingId: number | null = null;

  constructor(
    private laboratoryService: LaboratoryService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLaboratories();
  }

  loadLaboratories(): void {
    this.laboratoryService.getLaboratories().subscribe(laboratories => {
      this.laboratories = laboratories;
      this.changeDetectorRef.markForCheck();
    });
  }

  saveLaboratory(): void {
    const name = this.laboratory.name.trim();
    const location = this.laboratory.location.trim();
    const capacity = Number(this.laboratory.capacity);

    if (!name || !location || !Number.isInteger(capacity) || capacity < 1) {
      alert('Enter a laboratory name, location, and a positive whole-number capacity.');
      return;
    }

    const laboratory: LaboratoryInput = {
      name,
      location,
      capacity,
      status: this.laboratory.status
    };

    if (this.editingId !== null) {
      this.laboratoryService.updateLaboratory(this.editingId, laboratory).subscribe(() => {
        alert('Laboratory updated successfully!');
        this.loadLaboratories();
        this.resetForm();
      });
      return;
    }

    this.laboratoryService.addLaboratory(laboratory).subscribe(() => {
      alert('Laboratory added successfully!');
      this.loadLaboratories();
      this.resetForm();
    });
  }

  editLaboratory(laboratory: Laboratory): void {
    this.laboratory = {
      name: laboratory.name,
      location: laboratory.location,
      capacity: laboratory.capacity,
      status: laboratory.status
    };
    this.editingId = laboratory.id;
  }

  deleteLaboratory(id: number): void {
    if (confirm('Are you sure you want to delete this laboratory?')) {
      this.laboratoryService.deleteLaboratory(id).subscribe(() => {
        alert('Laboratory deleted successfully!');
        this.loadLaboratories();
      });
    }
  }

  resetForm(): void {
    this.laboratory = this.emptyLaboratory();
    this.editingId = null;
  }

  private emptyLaboratory(): LaboratoryInput {
    return {
      name: '',
      location: '',
      capacity: 1,
      status: 'Available'
    };
  }
}
