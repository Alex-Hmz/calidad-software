import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminPanelService } from '../../../shared/services/date-config/admin-panel.service';

@Component({
  selector: 'app-date-config',
  standalone: false,
  templateUrl: './date-config.component.html',
  styleUrl: './date-config.component.scss'
})
export class DateConfigComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private adminPanelService: AdminPanelService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      await this.adminPanelService.createFreeDay({
        date: this.form.value.date,
        reason: this.form.value.reason,
        createdAt: Date.now()
      });
      alert('Día bloqueado correctamente');
      this.form.reset();
    } catch (e: any) {
      alert('Error al bloquear el día: ' + e.message);
    } finally {
      this.loading = false;
    }
  }
}
