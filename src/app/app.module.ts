import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginModule } from './components/login/login.module';
import { ConfigService } from './services';
import { ConfigurationModule } from './components/configuration/configuration.module';
import { AppComponent, HomeComponent, HeaderComponent } from './components';
import { routing } from './app.routing';

@NgModule({
  declarations: [
    AppComponent, HomeComponent, HeaderComponent
  ],
  imports: [
    BrowserModule, ClarityModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    LoginModule,
    ConfigurationModule
  ],
  providers: [ConfigService],
  bootstrap: [AppComponent]
})
export class AppModule { }
