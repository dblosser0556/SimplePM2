import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CapWeightPercent } from '../models';

@Injectable()
export class ConfigService {
  rootDataUrl = 'http://localhost:5000/api';


  GREY = '#95a5a6';
  OFFWHITE = '#ecf0f1';
  BURNTORANGE = '#d35400';
  ORANGE = '#f39c12';
  GREEN = '#229954';
  LIGHTGRE = '#17a589';
  BLUE = '#2471a3';
  PURPLE = '#884ea0';
  RED = '#a93226';
  DARKGREY = '#34495e';



  capWeightConfig: CapWeightPercent[];


  constructor() {
    this.capWeightConfig = this.addCapWeightConfig();
  }

  addCapWeightConfig(): CapWeightPercent[] {
    let _capWeight: CapWeightPercent[];

    _capWeight = [{
      order: 1,
      title: '100%',
      description: '100% Capital',
      capWeight: 1,
      color: this.DARKGREY,
      colorDesc: 'DARKGREY',
      inUse: true
    }, {
      order: 2,
      title: '80%',
      description: '20% Expense 80% Capital',
      capWeight: .80,
      color: this.GREEN,
      colorDesc: 'GREEN',
      inUse: true
    }, {
      order: 3,
      title: '60%',
      description: '40% Expense 60% Capital',
      capWeight: .60,
      color: this.BLUE,
      colorDesc: 'BLUE',
      inUse: true,
    }, {
      order: 4,
      title: '50%',
      description: '50% Expense 50% Capital',
      capWeight: .50,
      color: this.PURPLE,
      colorDesc: 'PURPLE',
      inUse: true,
    }, {
      order: 5,
      title: '40%',
      description: '60% Expense 40% Capital',
      capWeight: .40,
      color: this.LIGHTGRE,
      colorDesc: 'LIGHTGREEN',
      inUse: true,
    }, {
      order: 6,
      title: '0%',
      description: '100% Expense',
      capWeight: .0,
      color: this.RED,
      colorDesc: 'RED',
      inUse: true,
    }
  ];

    return _capWeight;

  }

}
