import { Component, OnInit } from '@angular/core';

import { PhaseService } from './phase.service';
import { Phase } from '../../../models';
import { Observable } from 'rxjs/Observable';
import '../../../rxjs-extensions';

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

    constructor(private phaseService: PhaseService,
      ) {
    }

    ngOnInit() {
        this.getList();
    }




    onDelete(id: number) {
        if (confirm('Are you sure to delete this record?') === true) {
            this.phaseService.delete(id)
                .subscribe(x => {
                  //  this.snackBar.open('Phase has been deleted', '', {duration: 2000});
                    this.getList();
                });
        }
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
