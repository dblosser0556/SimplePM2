// include directives/components commonly used in features modules in this shared modules
// and import me into the feature module
// importing them individually results in: Type xxx is part
// of the declarations of 2 modules: ... Please consider
// moving to a higher module...
// https://github.com/angular/angular/issues/10646
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule  } from '@angular/platform-browser/animations';

import { ColspanDirective } from '../directives/colspan.directive';
import { MultiselectDirective } from '../directives/multiselect.directive';
import { FixedHeaderDirective } from '../directives/fixed-header.directive';

// import { ConfirmationComponent } from '../components/confirmation/confirmation.component';

import { ConfigService, UserService} from '../services';
import { UtilityService } from '../services/utility.service';


@NgModule({
  imports:      [CommonModule, HttpClientModule,  BrowserAnimationsModule],
  declarations: [ColspanDirective, MultiselectDirective, FixedHeaderDirective],
  exports:      [ColspanDirective, MultiselectDirective, FixedHeaderDirective],
  providers:    [ConfigService, UserService, UtilityService]
})
export class SharedModule { }

