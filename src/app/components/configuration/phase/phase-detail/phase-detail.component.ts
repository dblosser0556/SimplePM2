import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';

import { PhaseService } from '../../../../services';
import { UtilityService } from './../../../../services/utility.service';
import { Phase } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ToastrService } from 'ngx-toastr';


interface CreatePhase {
  phaseName: string;
  phaseDesc: string;
}

@Component({
  selector: 'app-phase-detail',
  templateUrl: './phase-detail.component.html',
  styleUrls: ['./phase-detail.component.scss']
})

export class PhaseDetailComponent implements OnInit, OnChanges {


  @Input() phase: Phase;
  @Output() phaseChange = new EventEmitter<Phase>();

  phaseForm: FormGroup;
  error: any;

  constructor(private phaseService: PhaseService,

    private fb: FormBuilder,
    private util: UtilityService,
    private toast: ToastrService) {
      this.createForm();
     }

  ngOnInit() {}

  ngOnChanges() {
    this.phaseForm.reset( {
      phaseId: this.phase.phaseId,
      phaseName: this.phase.phaseName,
      phaseDesc: this.phase.phaseDesc,
      phaseOrder: this.phase.order} );
  }

  onSubmit() {
    this.phaseForm.updateValueAndValidity();
    if (this.phaseForm.invalid) {
      return;
    }

    const phase: Phase = this.getPhaseFromFormValue(this.phaseForm.value);
    if (phase.phaseId !== null) {
      this.phaseService.update(phase.phaseId, phase).subscribe(data => {
        this.util.phaseListIsDirty = true;
        this.toast.success('Phase has been updated', 'Success');
        this.phaseChange.emit(phase);
      }, error => {
        this.toast.error('Something went wrong in updating your Phase', 'Oops');
        console.log(error); });
    } else {
      const newPhase: CreatePhase = {phaseName: phase.phaseName, phaseDesc: phase.phaseDesc};

      this.phaseService.create(JSON.stringify(newPhase)).subscribe(data => {
        // this.resetForm();
        this.phase = data;
        this.util.phaseListIsDirty = true;
        this.toast.success('Phase has been Added', 'Success');
        this.phaseChange.emit(phase);
      },
      error => {
        this.toast.error('Something went wrong in adding your Phase', 'Oops');
        console.log(error); });
    }
  }


  getPhaseFromFormValue(formValue: any): Phase {
    let phase: Phase;
    phase = new Phase();

    phase.phaseId = formValue.phaseId;
    phase.phaseName = formValue.phaseName;
    phase.phaseDesc = formValue.phaseDesc;
    phase.order = formValue.phaseOrder;
    return phase;

  }

  createForm() {
    this.phaseForm = this.fb.group({
      phaseId: '',
      phaseName: ['', Validators.required],
      phaseDesc: '',
      phaseOrder: ['', Validators.required]
    }
    );
  }

  get phaseName() {
    return this.phaseForm.get('phaseName');
  }

  get phaseOrder() {
    return this.phaseForm.get('phaseOrder');
  }

  revert() {this.ngOnChanges(); }

  cancel() { this.phaseChange.emit(this.phase); }

}
