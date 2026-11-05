import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Equipment, EquipmentInput, EquipmentService } from '../../services/equipment';

@Component({
  selector: 'app-equipment',
  imports: [FormsModule],
  templateUrl: './equipment.html',
  styleUrl: './equipment.css'
})
export class EquipmentManagement implements OnInit {
  equipmentList: Equipment[] = [];

  equipment: EquipmentInput = this.emptyEquipment();

  editingId: number | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.equipmentService.getEquipment().subscribe(equipment => {
      this.equipmentList = equipment;
      this.changeDetectorRef.markForCheck();
    });
  }

  saveEquipment(): void {
    const name = this.equipment.name.trim();
    const condition = this.equipment.condition.trim();
    const quantity = Number(this.equipment.quantity);

    if (!name || !condition || !Number.isInteger(quantity) || quantity <= 0) {
      alert('Enter an equipment name, a positive whole-number quantity, and a condition.');
      return;
    }

    const equipment: EquipmentInput = { name, quantity, condition };

    if (this.editingId !== null) {
      this.equipmentService.updateEquipment(this.editingId, equipment).subscribe(() => {
        alert('Equipment updated successfully!');
        this.loadEquipment();
        this.resetForm();
      });
      return;
    }

    this.equipmentService.addEquipment(equipment).subscribe(() => {
      alert('Equipment added successfully!');
      this.loadEquipment();
      this.resetForm();
    });
  }

  editEquipment(equipment: Equipment): void {
    this.equipment = {
      name: equipment.name,
      quantity: equipment.quantity,
      condition: equipment.condition
    };
    this.editingId = equipment.id;
  }

  deleteEquipment(id: number): void {
    if (confirm('Are you sure you want to delete this equipment?')) {
      this.equipmentService.deleteEquipment(id).subscribe(() => {
        alert('Equipment deleted successfully!');
        this.loadEquipment();
      });
    }
  }

  resetForm(): void {
    this.equipment = this.emptyEquipment();
    this.editingId = null;
  }

  private emptyEquipment(): EquipmentInput {
    return {
      name: '',
      quantity: 1,
      condition: ''
    };
  }
}
