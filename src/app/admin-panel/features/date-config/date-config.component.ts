import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminPanelService, FreeDay } from '../../../shared/services/date-config/admin-panel.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-date-config',
  standalone: false,
  templateUrl: './date-config.component.html',
  styleUrl: './date-config.component.scss'
})
export class DateConfigComponent {
  form: FormGroup;
  loading = false;
  bannedDays: FreeDay[] = [];

  constructor(
    private fb: FormBuilder,
    private adminPanelService: AdminPanelService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadBannedDays();
  }

  async loadBannedDays() {
    this.bannedDays = await this.adminPanelService.getFreeDays();
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        title: "Formulario incompleto",
        text: "Por favor completa todos los campos requeridos.",
        icon: "warning"
      });
      return;
    }
    this.loading = true;
    try {
      await this.adminPanelService.createFreeDay({
        date: this.form.value.date,
        reason: this.form.value.reason,
        createdAt: Date.now()
      });
      Swal.fire({
        title: "Día bloqueado",
        text: "Día bloqueado correctamente",
        icon: "success"
      });
      this.form.reset();
      await this.loadBannedDays(); // Refresh list after adding
    } catch (e: any) {
      Swal.fire({
        title: "Error",
        text: "Error al bloquear el día: " + e.message,
        icon: "error"
      });
    } finally {
      this.loading = false;
    }
  }
}
