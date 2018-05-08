import { Component, OnInit, Input } from '@angular/core';
import { Project, Milestone, Month, Phase } from '../../../models';
import { MilestoneChartData } from '../../dashboard/home/home.component';
import { MilestoneChartScaleLabel, MilestoneChartMilestone } from '../../milestone-chart/milestone-chart.component';
import * as moment from 'moment';
import { PhaseService } from '../../../services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-project-milestone-chart',
  templateUrl: './project-milestone-chart.component.html',
  styleUrls: ['./project-milestone-chart.component.scss']
})

export class ProjectMilestoneChartComponent implements OnInit {
  private _project = new BehaviorSubject<Project>(undefined);
  @Input() set project(value: Project) {
    this._project.next(value);
  }

  get project() {
    return this._project.getValue();
  }
  milestone: MilestoneChartData;
  startDate: string;
  phases: Phase[];
  isLoading = true;

  constructor(private phaseService: PhaseService) {
    this.isLoading = true;
  }

  ngOnInit() {
    this._project.subscribe(project => {
      if (project !== undefined) {
        this.getPhases();
      }
    });
  }

  getPhases() {
    this.phaseService.getAll().subscribe(results => {
      this.phases = results;
      this.setup();
    });
  }

  setup() {
    const chartMilestones = this.getMarkers(this.project.milestones);
    const scaleLabels = this.setScaleLabels();
    this.startDate = moment((this.project.actualStartDate) ?
      this.project.actualStartDate : this.project.plannedStartDate).startOf('month').format('YYYY-MM-DD');

    const barValues = this.setEvents(this.project.months);

    const milestoneChartData: MilestoneChartData = {
      projectName: this.project.projectName,
      milestones: chartMilestones,
      labels: scaleLabels,
      target: chartMilestones[chartMilestones.length - 1],
      startDate: (this.project.actualStartDate),
      barValues: barValues
    };
    this.milestone = milestoneChartData;
    this.isLoading = false;
  }

  // set up the phase based markers.
  getMarkers(projectMilestones: Milestone[]): MilestoneChartMilestone[] {

    projectMilestones.sort(function compare(left, right) {
      const _left = moment(left.phaseCompleteDate);
      const _right = moment(right.phaseCompleteDate);

      if (_left.isBefore(_right)) { return -1; }
      if (_left.isAfter(_right)) {return 1; }
      return 0;
    });

    const chartMilestones: MilestoneChartMilestone[] = [];
    let topMarker: MilestoneChartMilestone;
    let phaseTarget = 0;

    for (const projectMilestone of projectMilestones.filter(p => p.active === true)) {
      phaseTarget += projectMilestone.phaseCapitalEstimate + projectMilestone.phaseExpenseEstimate;

      const phase = this.phases.find(p => p.phaseId === projectMilestone.phaseId);

      topMarker = {
        value: (phaseTarget).toString(),
        label: phase.phaseName,
        date: moment(projectMilestone.phaseCompleteDate).endOf('month').format('YYYY-MM-DD')
      };
      chartMilestones.push(topMarker);
    }
    return chartMilestones;
  }



  setScaleLabels(): MilestoneChartScaleLabel[] {
    const labels: MilestoneChartScaleLabel[] = [];
    let label = {
      value: '80',
      label: '80%'
    };
    labels.push(label);
    label = {
      value: '100',
      label: '100%',
    };
    labels.push(label);

    label = {
      value: '120',
      label: '120%',
    };
    labels.push(label);

    label = {
      value: '140',
      label: '140%',
    };
    labels.push(label);

    return labels;
  }

  setEvents(months: Month[]): MilestoneChartMilestone[] {
    const barValues: MilestoneChartMilestone[] = [];

    months.sort(function compare(left, right) {
      return left.monthNo - right.monthNo;
    });

    let countActualCapMonths = 0;
    let countActualExpMonths = 0;
    let countPlannedMonths = 0;

    // caclulate actuals and EAC.
    let count = 0;
    for (const month of months) {
      if (month.totalActualCapital > 0) {
        countActualCapMonths = count;
      }

      if (month.totalActualExpense > 0) {
        countActualExpMonths = count;
      }

      if (month.totalPlannedCapital > 0 || month.totalPlannedExpense > 0) {
        countPlannedMonths = count;
      }
      count++;

    }
    const lastActualMonth = (countActualExpMonths >= countActualCapMonths) ? countActualExpMonths : countActualCapMonths;

    let actuals = 0;
    let eac = 0;
    count = 0;
    for (const month of months) {
      if (count < lastActualMonth) {
        eac += month.totalActualCapital + month.totalActualExpense;
      } else {
        eac += month.totalPlannedCapital + month.totalPlannedExpense;
      }
      actuals += month.totalActualCapital + month.totalActualExpense;
      count++;
    }

    const projectEnd = moment(this.startDate)
      .add(months[countPlannedMonths].monthNo, 'month')
      .endOf('month')
      .format('YYYY-MM-DD');

    const actualEvent: MilestoneChartMilestone = {
      value: (actuals).toString(),
      label: 'Actual',
      date: moment().format('YYYY-MM-DD')
    };

    const planEvent: MilestoneChartMilestone = {
      value: (eac).toString(),
      label: 'Plan',
      date: projectEnd
    };

    barValues.push(actualEvent);
    barValues.push(planEvent);
    return barValues;
  }

}
