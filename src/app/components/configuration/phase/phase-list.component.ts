import { Component, OnInit } from '@angular/core';

import { PhaseService } from './phase.service';
import { Phase } from '../../../models';
import { Observable } from 'rxjs/Observable';
import '../../../rxjs-extensions';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-phase-list',
    templateUrl: './phase-list.component.html',
    styleUrls: ['./phase-list.component.scss']
})

 
export class PhaseListComponent implements OnInit {

    phases: Phase[];
    selectedPhase: Phase;
    error: any;
    isLoading = false;
    selectedDelete: Phase;

    showDeleteConf = false;

    constructor(private phaseService: PhaseService,
        private toast: ToastrService
      ) {
    }

    ngOnInit() {
        this.getList();
    }




   
  confirmDelete(status: Phase) {
    this.selectedDelete = status;
    this.showDeleteConf = true;
  }

  onDelete() {
    this.showDeleteConf = false;
    this.phaseService.delete(this.selectedDelete.phaseId)
      .subscribe(x => {
        this.toast.success('Phase has been deleted', 'Success');
        this.getList();
      },
        error => {
          this.toast.error(error);
          console.log(error);
        });
  }

    getList() {
        this.isLoading = true;
        this.phaseService.getAll()
            .subscribe(results => {
                this.phases = results;
                this.isLoading = false;
            },
            error => this.error = error);
        this.selectedPhase = undefined;
    }

    add() {
        this.selectedPhase = { phaseName: '', phaseDesc: '', phaseId: null };
    }

    edit(phase: Phase) {
        this.selectedPhase = phase;
    }

    updateList(event: any) {
        this.getList();
    }
}
