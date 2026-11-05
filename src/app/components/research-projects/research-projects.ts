
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResearchService } from '../../services/research';

@Component({
  selector: 'app-research-projects',
  imports: [FormsModule],
  templateUrl: './research-projects.html',
  styleUrl: './research-projects.css'
})
export class ResearchProjects implements OnInit {

  projects: any[] = [];

  project: any = {
    title: '',
    department: '',
    faculty: '',
    status: 'Ongoing'
  };

  editingId: number | null = null;

  constructor(
    private researchService: ResearchService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.researchService.getProjects().subscribe(data => {
      this.projects = data;
      this.changeDetectorRef.markForCheck();
    });
  }

  saveProject(): void {

    if (
      !this.project.title.trim() ||
      !this.project.department.trim() ||
      !this.project.faculty.trim()
    ) {
      alert('Please fill all fields');
      return;
    }

    if (this.editingId !== null) {

      this.researchService.updateProject(
        this.editingId,
        this.project
      ).subscribe(() => {
        alert('Project updated successfully!');
        this.loadProjects();
        this.resetForm();
      });

    } else {

      this.researchService.addProject(this.project).subscribe(() => {
        alert('Project added successfully!');
        this.loadProjects();
        this.resetForm();
      });

    }
  }

  editProject(p: any): void {
    this.project = { ...p };
    this.editingId = p.id;
  }

  deleteProject(id: number): void {

    if (confirm('Are you sure you want to delete this project?')) {

      this.researchService.deleteProject(id).subscribe(() => {
        alert('Project deleted successfully!');
        this.loadProjects();
      });

    }
  }

  resetForm(): void {
    this.project = {
      title: '',
      department: '',
      faculty: '',
      status: 'Ongoing'
    };

    this.editingId = null;
  }
}
