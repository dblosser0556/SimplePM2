import { AbstractControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

/** The select value cannot be -1 (-Select-) */
export function invalidSelectValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<{[key: string]: any} | null> | Observable <{[key: string]: any} | null> => {
      const invalidSelect = (control.value === '-1') ? true : false;
      return Observable.of(invalidSelect ? {'invalidSelect': {value: 'Please select value'}} : null);
    };
  }

