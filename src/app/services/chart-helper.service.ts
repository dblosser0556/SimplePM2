import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Budget, Month, BudgetType, ChartData, SeriesData } from '../models';

@Injectable()
export class ChartHelperService {

 // convert the monthly data to an array of cummulative data
 public convertData (months: Month[], budgets: Budget[],
    viewCapValues: boolean, viewExpValues: boolean, startDate: string ): ChartData[] {
    // empty the data
    const data = new Array<ChartData>();

    const plannedCapitalSeries = new Array();
    const actualCapitalSeries = new Array();
    const capitalBudgetSeries = new Array();
    const plannedExpenseSeries = new Array();
    const actualExpenseSeries = new Array();
    const expenseBudgetSeries = new Array();
    const capEAC = new Array();
    const expEAC = new Array();


    const plannedStartDate = moment(startDate);
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

    // calculate the total budget
    count = 0;
    let totalCapitalBudget = 0;
    let totalExpenseBudget = 0;
    for (const budget of budgets) {
      if (budget.budgetType === BudgetType.Capital) {
        totalCapitalBudget += budget.amount;
      } else {
        totalExpenseBudget += budget.amount;
      }
    }

   // const months = this.project.months;


    for (let i = 0; i <= countPlannedMonths; i++) {

      const monthName = plannedStartDate.month(months[i].monthNo).format('YYYY-MM');
      let rowData: SeriesData;

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
        if (count < lastActualMonth) {
          cumCapEAC += months[i].totalActualCapital;

        } else {
          cumCapEAC += months[i].totalPlannedCapital;
        }
        rowData = {
          name: monthName,
          value: cumCapEAC
        };
        capEAC.push(rowData);



        rowData = {
          name: monthName,
          value: totalCapitalBudget
        };
        capitalBudgetSeries.push(rowData);
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
        if (count < lastActualMonth) {

          cumExpEAC += months[i].totalActualExpense;
          actualExpenseSeries.push(rowData);
        } else {
          cumCapEAC += months[i].totalPlannedExpense;
        }
        rowData = {
          name: monthName,
          value: cumCapEAC
        };
        expEAC.push(rowData);

        rowData = {
          name: monthName,
          value: totalExpenseBudget
        };
        expenseBudgetSeries.push(rowData);
      }
    }

    let chartData: ChartData;

    if (viewCapValues) {
      chartData = {
        name: 'Planned Capital',
        series: plannedCapitalSeries
      };
      data.push(chartData);


      chartData = {
        name: 'Capital Budget',
        series: expenseBudgetSeries
      };
      data.push(chartData);

      chartData = {
        name: 'Cap EAC',
        series: capEAC
      };
      data.push(chartData);

    }

    if (viewExpValues) {
      chartData = {
        name: 'Planned Expense',
        series: plannedExpenseSeries
      };
      data.push(chartData);

      chartData = {
        name: 'Expense Budget',
        series: expenseBudgetSeries
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
}
