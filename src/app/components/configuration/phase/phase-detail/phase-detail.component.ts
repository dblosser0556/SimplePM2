import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';

import { PhaseService } from './../phase.service';
import { UtilityService } from './../../../../services/utility.service';
import { Phase } from '../../../../models';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';


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
    private util: UtilityService) {
      this.createForm();
     }

  ngOnInit() {}

  ngOnChanges() {
    this.phaseForm.reset( {
      phaseID: this.phase.phaseId,
      phaseName: this.phase.phaseName,
      phaseDesc: this.phase.phaseDesc} );
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
          // this.snackBar.open('Phase has been updated', '', {duration: 2000});
        this.phaseChange.emit(phase);
      });
    } else {
      const newPhase: CreatePhase = {phaseName: phase.phaseName, phaseDesc: phase.phaseDesc};

      this.phaseService.create(JSON.stringify(newPhase)).subscribe(data => {
        // this.resetForm();
        this.phase = data;
        this.util.phaseListIsDirty = true;
        //  this.snackBar.open('Phase has been Added', '', {duration: 2000});
        this.phaseChange.emit(phase);
      },
      error => this.error = error);
    }
  }


  getPhaseFromFormValue(formValue: any): Phase {
    let phase: Phase;
    phase = new Phase();

    phase.phaseId = formValue.phaseId;
    phase.phaseName = formValue.phaseName;
    phase.phaseDesc = formValue.phaseDesc;
    return phase;

  }

  createForm() {
    this.phaseForm = this.fb.group({
      phaseId: '',
      phaseName: ['', Validators.required],
      phaseDesc: ''
    }
    );
  }


  revert() {this.ngOnChanges(); }

  cancel() { this.phaseChange.emit(this.phase); }

}
