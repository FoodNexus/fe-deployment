import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,
         FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DigitalContractService }
  from '../../../services/digital-contract.service';

@Component({
  selector: 'app-digital-contract-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './digital-contract-form.component.html',
  styleUrls: ['./digital-contract-form.component.scss']
})
export class DigitalContractFormComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private service: DigitalContractService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Seulement fiscalDeductionValue
    // donorId, receiverId, deliveryId → récupérés automatiquement côté backend
    this.form = this.fb.group({
      fiscalDeductionValue: ['', [Validators.required, Validators.min(0)]]
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.service.create(this.form.value).subscribe({
      next: () => this.router.navigate(['/audit/contracts']),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur de création';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/audit/contracts']);
  }
}