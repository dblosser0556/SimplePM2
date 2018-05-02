import { Component, OnInit, Input } from '@angular/core';
import { Project, Phase, BudgetType, Milestone } from '../../../models';
import { MilestoneService } from '../../../services';
import { PhaseService } from '../../configuration/phase/phase.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { DecimalPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
  private _project = new BehaviorSubject<Project>(undefined);
  @Input() set project(value: Project) {
    this._project.next(value);
  }

  get project() {
    return this._project.getValue();
  }

  constructor(private milestoneService: MilestoneService,
    private phaseService: PhaseService,
    private toast: ToastrService,
    private dp: DecimalPipe) { }

  phases: Phase[];
  milestoneDates = [];
  planDates = [];
  planFinishDate: string;
  milestoneFinishDate: string;
  isLate = false;
  isReallyLate = false;
  noSave = false;

  totalCapBudget: number;

  capitalMilestones = [];
  totalCapMilestone: number;
  capMilestoneToBudget: number;

  capitalEAC = [];
  capitalEACValue = [];
  totalCapEAC: number;
  capEACToBudget: number;

  totalExpBudget: number;

  expenseMilestones = [];
  totalExpMilestone: number;
  expMilestoneToBudget: number;

  expenseEAC = [];
  expenseEACValue = [];
  totalExpEAC: number;
  expEACToBudget: number;
  isLoading: boolean;
  notStarted: boolean;

  ngOnInit() {
    this.isLoading = true;
    this._project.subscribe(project => {
      if (project !== undefined) {
        this.isLoading = true;
        this.getPhases();
      }
    });

  }


  getPhases() {
    this.phaseService.getAll().subscribe(
      results => {
        this.phases = results;
        this.getBudgetTotals();
        this.setMilestoneTable();
        this.isLoading = false;
        if (this.project.actualStartDate === null) {
          this.notStarted = true;
        }
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

  // add the budgets by budget type.
  getBudgetTotals() {
    this.totalCapBudget = 0;
    this.totalExpBudget = 0;

    for (const budget of this.project.budgets) {
      if (budget.budgetType === BudgetType.Capital) {
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
      // ensure a milestone is set for each phase.
      let milestoneFound = false;

      // go through the active milestones and add them to the array.
      for (const milestone of this.project.milestones.filter(m => m.active)) {
        if (phase.phaseId === milestone.phaseId) {
          this.milestoneDates.push(moment(milestone.phaseCompleteDate).format('YYYY-MM'));
          this.capitalMilestones.push(this.dp.transform(milestone.phaseCapitalEstimate, '1.0-0'));
          this.totalCapMilestone += milestone.phaseCapitalEstimate;
          this.expenseMilestones.push(this.dp.transform(milestone.phaseExpenseEstimate, '1.0-0'));
          this.totalExpMilestone += milestone.phaseExpenseEstimate;
          milestoneFound = true;
          this.milestoneFinishDate = (moment(milestone.phaseCompleteDate).format('YYYY-MM'));
        }
      }
      // if no milestone found then add a place holder
      if (!milestoneFound) {
        this.milestoneDates.push('None');
        this.capitalMilestones.push('None');
        this.expenseMilestones.push('None');
        this.milestoneFinishDate = ('Not Found');
      }
    }
  }

  // calculate the phase dates based on the current plan.
  // by going through the set of months and finding the
  // last month by phase and adding all of the costs
  // for each month by phase.
  getPlanDates() {
    this.planDates = Array();
    this.capitalEAC = new Array();
    this.capitalEACValue = new Array();
    this.totalCapEAC = 0;
    this.expenseEAC = new Array();
    this.expenseEACValue = new Array();
    this.totalExpEAC = 0;

    // to calculate EAC need to find the last month with actuals
    // this compensates for when the user doesn't keep his
    // actuals up to date.
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
    // the last actual month is the last month with an actual value either expense or capital.
    const lastActualMonth = (countActualExpMonths >= countActualCapMonths) ? countActualExpMonths : countActualCapMonths;

    // this logic is looking for the last date with a particular phase.  The phases dont'
    // have to be in any particular order.  It can go 1/2/1/2/3/4 for example and the last 1 and 2 should
    // be selected.
    const defaultDate = moment([1800]);
    let phaseDate = moment([1800]);
    for (const phase of this.phases) {
      phaseDate = moment([1800]);
      let phaseCap = 0;
      let phaseExp = 0;

      for (const month of this.project.months) {
        if (phase.phaseId === month.phaseId) {
          if (phaseDate < moment(this.project.actualStartDate).add(month.monthNo, 'M')) {
            phaseDate = moment(this.project.actualStartDate).add(month.monthNo, 'M');
          }

          // add in the actuals or the plan to use EAC
          if (month.monthNo <= lastActualMonth) {
            phaseCap += month.totalActualCapital;
            phaseExp += month.totalActualExpense;
          } else {
            phaseCap += month.totalPlannedCapital;
            phaseExp += month.totalPlannedExpense;
          }
        }
      }
      // ensure a phase was found  if not then
      // set up some defaults
      if (phaseDate.isSame(defaultDate, 'day')) {
        this.capitalEAC.push('Not Found');
        this.expenseEAC.push('Not Found');
        this.planDates.push('Not Found');
        this.noSave = true;
      } else {
        this.capitalEAC.push(this.dp.transform(phaseCap, '1.0-0'));
        this.capitalEACValue.push(phaseCap);
        this.totalCapEAC += phaseCap;
        this.expenseEAC.push(this.dp.transform(phaseExp, '1.0-0'));
        this.expenseEACValue.push(phaseExp);
        this.totalExpEAC += phaseExp;
        this.planDates.push(phaseDate.format('YYYY-MM'));
      }
    }
    // the finish date is the last phase date.
    if (phaseDate.isSame(defaultDate, 'day')) {
      this.planFinishDate = 'Not Found';
      this.isLate = true;
    } else {
      this.planFinishDate = phaseDate.format('YYYY-MM');
      if (this.planFinishDate > this.milestoneFinishDate) {
        this.isLate = true;
      }
    }
  }

  onSubmit() {
    const milestones = new Array<Milestone>();

    // set all of the current milestones as inactive.
    for (const milestone of this.project.milestones) {
      milestone.active = false;
      milestones.push(milestone);
    }

    // add new milestone for each phase.
    let index = 0;
    for (const phase of this.phases) {
      const milestone = new Milestone();
      milestone.milestoneId = 0;
      milestone.phaseId = phase.phaseId;
      milestone.projectId = this.project.projectId;
      milestone.active = true;
      milestone.phaseCompleteDate = this.planDates[index];
      milestone.phaseCapitalEstimate = this.capitalEACValue[index];
      milestone.phaseExpenseEstimate = this.expenseEACValue[index];
      milestone.setDateTime = moment().toDate();
      index++;
      milestones.push(milestone);
    }

    // go through the current and newly add milestones
    for (const milestone of milestones) {
      if (milestone.milestoneId === 0) {
        this.milestoneService.create(JSON.stringify(milestone)).subscribe(
          results => {
            // add the new milestones to the current project.
            let newMilestone = new Milestone();
            newMilestone = JSON.parse(results._body);
            this.project.milestones.push(newMilestone);
          },
          error => {
            this.toast.error(error, 'Oops');
          }
        );
      } else {
        // this is a current milestone for update it to be inactive.
        this.milestoneService.update(milestone.milestoneId, milestone).subscribe(
          results => {
            // get the results back.
            let newMilestone = new Milestone();
            newMilestone = JSON.parse(results._body);

            // find the milestone in the current list for the project and mark it inactive here
            const index2 = this.project.milestones.findIndex(m => m.milestoneId === newMilestone.milestoneId);
            if (index2 >= 0) {
              this.project.milestones[index2].active = false;
            }
          }
        );
      }

    }

  }
}





