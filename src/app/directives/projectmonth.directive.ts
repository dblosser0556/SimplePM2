import { Directive, ElementRef, HostListener, EventEmitter, Output, Input } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { CapWeightPercent } from '../models';

@Directive({
    selector: '[appProjectMonth]'
})
export class ProjectMonthDirective {
    @Input('appProjectMonth') appProjectMonth: string;
    @Input('menuItem') menuItem: string;

    capWeightConfig: CapWeightPercent[];

    constructor(private el: ElementRef,
        private config: ConfigService) {

        this.capWeightConfig = this.config.capWeightConfig;
        this.setMenuItem();
        this.setElement();
    }

    @HostListener('change', ['$event']) onchange(el) {
        this.setElement();
    }

    setMenuItem() {
        const item = Number(this.menuItem);
        this.el.nativeElement.BackColor = this.capWeightConfig[item].color;
        this.el.nativeElement.InnerHTML = this.capWeightConfig[item].title;
        this.el.nativeElement.visible = this.capWeightConfig[item].inUse;
    }

    setElement() {
        const weightPer = Number(this.appProjectMonth);
        this.capWeightConfig.forEach(element => {
            if (element.capWeight === weightPer) {
                this.el.nativeElement.foreColor = element.color;
            }
        });
    }
}



