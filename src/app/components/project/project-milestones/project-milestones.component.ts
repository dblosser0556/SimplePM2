import { Component, OnInit, Input } from '@angular/core';
import { Project, Phase, BudgetType, Milestone } from '../../../models';
import { MilestoneService } from '../../../services';
import { PhaseService } from '../../configuration/phase/phase.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

export interface PhaseMilestone {
  phaseId: number;
  date: string;
  capital: number;
  expense: number;
}

@Component({
  selector: 'app-project-milestones',
  templateUrl: './project-milestones.component.html',
  styleUrls: ['./project-milestones.component.scss']
})
export class ProjectMilestonesComponent implements OnInit {
  @Input() project: Project;
  constructor(private milestoneService: MilestoneService,
    private phaseService: PhaseService,
    private toast: ToastrService) { }

  phases: Phase[];
  milestoneDates = [];
  planDates = [];

  totalCapBudget: number;

  capitalMilestones = [];
  totalCapMilestone: number;
  capMilestoneToBudget: number;

  capitalEAC = [];
  totalCapEAC: number;
  capEACToBudget: number;

  totalExpBudget: number;

  expenseMilestones = [];
  totalExpMilestone: number;
  expMilestoneToBudget: number;

  expenseEAC = [];
  totalExpEAC: number;
  expEACToBudget: number;



  ngOnInit() {
    this.getPhases();

  }


  getPhases() {
    this.phaseService.getAll().subscribe(
      results => {
        this.phases = results;
        this.getBudgetTotals();
        this.setMilestoneTable();
      });
  }

  setMilestoneTable() {
    this.getBudgetTotals();
    this.getMilestones();
    this.getPlanDates();

    this.capMilestoneToBudget = this.totalCapBudget - this.totalCapMilestone;
    this.capEACToBudget = this.totalCapBudget - this.totalCapEAC;
    this.expMilestoneToBudget = this.totalExpBudget - this.totalExpMilestone;
    this.expEACToBudget = this.totalExpBudget - this.totalExpEAC;
  }

  getBudgetTotals() {
    this.totalCapBudget = 0;
    this.totalExpBudget = 0;

    for (const budget of this.project.budgets) {
      if (budget.budgetType = BudgetType.Capital) {
        this.totalCapBudget += budget.amount;
      } else {
        this.totalExpBudget += budget.amount;
      }

    }
  }

  getMilestones() {

    this.milestoneDates = new Array();
    this.capitalMilestones = new Array();
    this.expenseMilestones = new Array();
    this.totalCapMilestone = 0;
    this.totalExpMilestone = 0;

    // go through the active milestones
    // assume only one milestone per phase.
    for (const phase of this.phases) {
      for (const milestone of this.project.milestones.filter(m => m.active)) {
        if (phase.phaseId === milestone.phaseId) {
          this.milestoneDates.push(moment(milestone.phaseCompleteDate).format('YYYY-MM'));
          this.capitalMilestones.push(milestone.phaseCapitalEstimate);
          this.totalCapMilestone += milestone.phaseCapitalEstimate;
          this.expenseMilestones.push(milestone.phaseExpenseEstimate);
          this.totalExpMilestone += milestone.phaseExpenseEstimate;
        }
      }
    }
  }

  getPlanDates() {
    this.planDates = Array();
    this.capitalEAC = new Array();
    this.totalCapEAC = 0;
    this.expenseEAC = new Array();
    this.totalExpEAC = 0;

    let count = 0;
    let countActualCapMonths = 0;
    let countActualExpMonths = 0;
    for (const month of this.project.months) {
      if (month.totalActualCapital > 0) {
        countActualCapMonths = count;
      }
      if (month.totalActualExpense > 0) {
        countActualExpMonths = count;
      }
      count++;
    }
    const lastActualMonth = (countActualExpMonths >= countActualCapMonths) ? countActualExpMonths : countActualCapMonths;


    for (const phase of this.phases) {
      let phaseDate = moment('01/01/1800');
      let phaseCap = 0;
      let phaseExp = 0;

      for (const month of this.project.months) {
        if (phase.phaseId === month.phaseId) {
          if (phaseDate < moment(this.project.actualStartDate).add(month.monthNo, 'M')) {
            phaseDate = moment(this.project.actualStartDate).add(month.monthNo, 'M');
          }

          if (month.monthNo <= lastActualMonth) {
            phaseCap += month.totalActualCapital;
            phaseExp += month.totalActualExpense;
          } else {
            phaseCap += month.totalPlannedCapital;
            phaseExp += month.totalPlannedExpense;
          }
        }
      }
      this.capitalEAC.push(phaseCap);
      this.totalCapEAC += phaseCap;
      this.expenseEAC.push(phaseExp);
      this.totalExpEAC += phaseExp;
      this.planDates.push(phaseDate.format('YYYY-MM'));
    }
  }

  onSubmit() {
    const milestones = new Array<Milestone>();

    // set all of the current milestones as inactive.
    for (const milestone of this.project.milestones) {
      milestone.active = false;
      milestones.push(milestone);
    }

    let index = 0;
    for ( const phase of this.phases) {
      const milestone = new Milestone();
      milestone.milestoneId = 0;
      milestone.phaseId = phase.phaseId;
      milestone.projectId = this.project.projectId;
      milestone.active = true;
      milestone.phaseCompleteDate = this.planDates[index];
      milestone.phaseCapitalEstimate = this.capitalMilestones[index];
      milestone.phaseExpenseEstimate = this.expenseMilestones[index];
      milestone.setDateTime = moment().toDate();
      index++;
      milestones.push(milestone);
    }

    for (const milestone of milestones) {
      if (milestone.milestoneId === 0) {
        this.milestoneService.create(JSON.stringify(milestone)).subscribe(
          results => {
            // add the new milestones
            let newMilestone = new Milestone();
            newMilestone = JSON.parse(results._body);
            this.project.milestones.push(newMilestone);
          }
        );
      } else {
        this.milestoneService.update(milestone.milestoneId, milestone).subscribe(
          results => {
            let newMilestone = new Milestone();
            newMilestone = JSON.parse(results._body);

            const index2 = this.project.milestones.findIndex(m => m.milestoneId === newMilestone.milestoneId);
            if (index2 >= 0) {
              this.project.milestones[index2].active = false;
            }
          }
        );
      }
      
    }
    this.setMilestoneTable();
    this.toast.success('Milestones have been updated');
  }
}





