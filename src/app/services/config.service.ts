import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CapWeightPercent } from '../models';

@Injectable()
export class ConfigService {
  rootDataUrl = 'http://localhost:5000/api';


  COOLGREY = '#314351';
  COOLGREYBG = '#F3F6FA';
  REDORANGE = '#DE400F';
  REDORANGEBG = '#FFE5DC';
  YELLOW = '#D28F00';
  YELLOWBG = '#FFFCE8';
  TEAL = '#007E7A';
  TEALBG = '#DEFFF9';
  BLUE = '#1A23A0';
  BLUEBG = '#EBF0FF';
 
  PURPLE = '#660092';
  PURPLEBG = '#F3E6FF';
 



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
      color: this.COOLGREY,
      colorDesc: 'COOLGREY',
      bgColor: this.COOLGREYBG,
      inUse: true
    }, {
      order: 2,
      title: '80%',
      description: '20% Expense 80% Capital',
      capWeight: .80,
      color: this.REDORANGE,
      colorDesc: 'REDORANGE',
      bgColor: this.REDORANGEBG,
      inUse: true
    }, {
      order: 3,
      title: '60%',
      description: '40% Expense 60% Capital',
      capWeight: .60,
      color: this.YELLOW,
      colorDesc: 'YELLOW',
      bgColor: this.YELLOWBG,
      inUse: true,
    }, {
      order: 4,
      title: '50%',
      description: '50% Expense 50% Capital',
      capWeight: .50,
      color: this.TEAL,
      colorDesc: 'TEAL',
      bgColor: this.TEALBG,
      inUse: true,
    }, {
      order: 5,
      title: '40%',
      description: '60% Expense 40% Capital',
      capWeight: .40,
      color: this.BLUE,
      colorDesc: 'BLUE',
      bgColor: this.BLUEBG,
      inUse: true,
    }, {
      order: 6,
      title: '0%',
      description: '100% Expense',
      capWeight: .0,
      color: this.PURPLE,
      colorDesc: 'PURPLE',
      bgColor: this.PURPLEBG,
      inUse: true,
    }
  ];

    return _capWeight;

  }

}
