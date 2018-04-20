import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Budget, Month, BudgetType, ChartData, SeriesData, ProjectMilestone, GroupBudget, ProjectMonthlyProjection } from '../models';


@Injectable()
export class ChartHelperService {

  // convert the monthly data to an array of cummulative data
  public convertData(months: Month[],
    viewCapValues: boolean, viewExpValues: boolean, startDate: string,
    budgets?: Budget[], groupBudgets?: GroupBudget[]): ChartData[] {
    // empty the data
    const data = new Array<ChartData>();

    const plannedCapitalSeries = new Array<SeriesData>();
    const actualCapitalSeries = new Array<SeriesData>();
    const capitalBudgetSeries = new Array<SeriesData>();
    const capitalGroupBudgetSeries = new Array<SeriesData>();
    const plannedExpenseSeries = new Array<SeriesData>();
    const actualExpenseSeries = new Array<SeriesData>();
    const expenseBudgetSeries = new Array<SeriesData>();
    const expenseGroupBudgetSeries = new Array<SeriesData>();

    const capEAC = new Array<SeriesData>();
    const expEAC = new Array<SeriesData>();


    let cumPlannedCap = 0;
    let cumPlannedExp = 0;

    let cumCapEAC = 0;
    let cumExpEAC = 0;

    let countActualCapMonths = 0;
    let countActualExpMonths = 0;
    let countPlannedMonths = 0;

    // for EAC find the last actual month
    // the assumption is the last actual month
    // with a value will be used
    // also find the last planned month so we only
    // chart planned months.  There maybe project
    // months that are unplanned but in the array.
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

    // check optional parameters
    let hasBudget = true;
    if (budgets === undefined) {
      hasBudget = false;
    }

    let hasGroupBudget = true;
    if (groupBudgets === undefined) {
      hasGroupBudget = false;
    }


    // calculate the total budget
    // budgets can be added at different
    // times during the project.
    count = 0;

    let totalCapitalBudget = 0;
    let totalExpenseBudget = 0;
    if (hasBudget) {

      for (const budget of budgets) {
        if (budget.budgetType === BudgetType.Capital) {
          totalCapitalBudget += budget.amount;
        } else {
          totalExpenseBudget += budget.amount;
        }
      }
    }





    for (let i = 0; i <= countPlannedMonths; i++) {
      // set the name of the month with is the start date plus the number of months
      // from the start.
      const monthName =  moment(startDate).add(i, 'month').format('YYYY-MM');
      let rowData: SeriesData;

      // check to see if we are viewing capital
      if (viewCapValues) {

        // add a series element for all planned months
        cumPlannedCap += months[i].totalPlannedCapital;
        rowData = {
          name: monthName,
          value: cumPlannedCap
        };
        plannedCapitalSeries.push(rowData);

        // create the EAC series which is the actual series
        // extended by the EAC series so we can show a
        // two colored line.
        if (i < lastActualMonth) {
          cumCapEAC += months[i].totalActualCapital;
        } else {
          cumCapEAC += months[i].totalPlannedCapital;
        }
        rowData = {
          name: monthName,
          value: cumCapEAC
        };
        capEAC.push(rowData);


        if (hasBudget) {
          rowData = {
            name: monthName,
            value: totalCapitalBudget
          };
          capitalBudgetSeries.push(rowData);
        }

        if (hasGroupBudget) {
          rowData = {
            name: monthName,
            value: this.matchYear(monthName, groupBudgets, BudgetType.Capital)
          };
          capitalGroupBudgetSeries.push(rowData);
        }
      }

      if (viewExpValues) {


        cumPlannedExp += months[i].totalPlannedExpense;
        rowData = {
          name: monthName,
          value: cumPlannedExp
        };
        plannedExpenseSeries.push(rowData);

        // create the EAC series which is the actual series
        // extended by the EAC series so we can show a
        // two colored line.
        if (i < lastActualMonth) {
          cumExpEAC += months[i].totalActualExpense;
        } else {
          cumExpEAC += months[i].totalPlannedExpense;
        }
        rowData = {
          name: monthName,
          value: cumExpEAC
        };
        expEAC.push(rowData);

        if (hasBudget) {
          rowData = {
            name: monthName,
            value: totalExpenseBudget
          };
          expenseBudgetSeries.push(rowData);
        }
        if (hasGroupBudget) {
          rowData = {
            name: monthName,
            value: this.matchYear(monthName, groupBudgets, BudgetType.Expense)
          };
          expenseGroupBudgetSeries.push(rowData);
        }
      }

    }

    let chartData: ChartData;


    if (viewCapValues) {

      if (hasBudget) {
        chartData = {
          name: 'Cap Bgt',
          series: capitalBudgetSeries
        };
        data.push(chartData);
      }

      if (hasGroupBudget) {
        chartData = {
          name: 'Yearly Cap Bug',
          series: capitalGroupBudgetSeries
        };
        data.push(chartData);
      }

      chartData = {
        name: 'Cap Plan',
        series: plannedCapitalSeries
      };
      data.push(chartData);


      chartData = {
        name: 'Cap EAC',
        series: capEAC
      };
      data.push(chartData);
    }

    if (viewExpValues) {

      if (hasBudget) {
        chartData = {
          name: 'Exp Bgt',
          series: expenseBudgetSeries
        };
        data.push(chartData);
      }

      if (hasGroupBudget) {
        chartData = {
          name: 'Yearly Exp Bgt',
          series: expenseGroupBudgetSeries
        };
        data.push(chartData);
      }

      chartData = {
        name: 'Exp Plan',
        series: plannedExpenseSeries
      };
      data.push(chartData);

      chartData = {
        name: 'Exp EAC',
        series: expEAC
      };
      data.push(chartData);

    }
    return data;
  }

  groupMonths(monthlyProjections: ProjectMonthlyProjection[]): Month[] {
    const months = new Array<Month>();

    // the list of monthly projections are ordered by the month.
    // so go through each month and add up the total forecasts and actual
    // costs.

    let capActual = 0;
    let capPlan = 0;
    let expActual = 0;
    let expPlan = 0;
    let monthNo = 0;

    monthlyProjections.sort((leftside, rightside): number => {
      if (moment(leftside.month).isBefore(rightside.month)) { return -1; }
      if (moment(leftside.month).isAfter(rightside.month)) { return 1; }
      return 0;
    });

    let curMonth = moment(monthlyProjections[0].month);

    for (const projection of monthlyProjections) {
      if (moment(projection.month).isAfter(curMonth)) {
        // create new month and add to the array to be returned.
        const month = new Month();
        month.monthNo = monthNo;
        month.totalActualCapital = capActual;
        month.totalActualExpense = expActual;
        month.totalPlannedCapital = capPlan;
        month.totalPlannedExpense = expPlan;

        months.push(month);

        // reset the total holders
        curMonth = moment(projection.month);
        capActual = 0;
        capPlan = 0;
        expActual = 0;
        expPlan = 0;
        monthNo++;

      }

      capActual += projection.totalActualCapital;
      capPlan += projection.totalPlannedCapital;
      expActual += projection.totalActualExpense;
      expPlan += projection.totalPlannedExpense;
    }
    // add the final month
    const lastMonth = new Month();
    lastMonth.monthNo = monthNo;
    lastMonth.totalActualCapital = capActual;
    lastMonth.totalActualExpense = expActual;
    lastMonth.totalPlannedCapital = capPlan;
    lastMonth.totalPlannedExpense = expPlan;

    months.push(lastMonth);



    return months;
  }

  private matchYear(monthName: string, groupBudgets: GroupBudget[], budgetType: BudgetType): number {
    // monthName is of the form YYYY-MM
    const year = monthName.split('-');

    // convert to number for comparison.
    const budgetYear = Number(year[0]);

    const index = groupBudgets.findIndex(b => (b.budgetYear === budgetYear && b.budgetType === budgetType));
    if (index >= 0) {
      return groupBudgets[index].amount;
    }
    return 0;
  }
}
