import { Component, OnInit, Input, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { CapWeightPercent, Project, Resource } from '../../../models';

@Component({
    selector: 'app-command-menu',
    template: ` <button type="button" class="btn"
        (click)="updateCapWeightPercent([menuItem.capWeight], [menuItem.order])"
        title={{menuItem.description}}>{{menuItem.title}}</button>`
})
export class CommandMenuComponent implements OnInit {

    @Input() menuItem: CapWeightPercent;
    @Input() project: Project;
    @Input() item: number;
    @Input() selectedCells: any[];
    @Input() selectedView: string;

    @Output() updateAllMonthlyTotals = new EventEmitter();

    constructor(private el: ElementRef,
        private renderer: Renderer2) { }

    ngOnInit() {

        this.renderer.setAttribute(this.el.nativeElement.childNodes[1], 'innerText', this.menuItem.title);
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'backgroundColor', this.menuItem.bgColor);
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderColor', this.menuItem.color);
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'color', this.menuItem.color);
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'margin-right', '0px');
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderRadius', '0px');
        this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'padding', '0px');

        if (this.item === 0) {
            this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderBottomLeftRadius', '5px');
            this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderTopLeftRadius', '5px');
        }

        if (this.item === 5) {
            this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderBottomRightRadius', '5px');
            this.renderer.setStyle(this.el.nativeElement.childNodes[1], 'borderTopRightRadius', '5px');
        }

    }
    updateCapWeightPercent(percent: number, style: number) {
        // the ids are added to the selected ids array through the multi-select directive
        // in the form type-typeId-monntid.  e.g. 'res-1-8' resource, resourceId,and resourceMonthId
        // or 'fix-1-8' fixedprice, fixedPriceId, fixedPriceMonthId

        for (const el of this.selectedCells) {
            el.classList.remove('eng-selected-item');
            el.classList.remove('hover-area');
            const cells = el.attributes['id'].nodeValue.split('+');
            if (cells[0] === 'res') {
                // go through the set of resoruce and months and update to percent
                for (const res of this.project.resources) {
                    for (const mon of res.resourceMonths) {
                        if (res.resourceId === Number(cells[1]) && mon.resourceMonthId === Number(cells[2])) {
                            if (this.selectedView === 'Forecast') {
                                // this passes the values is as an array of
                                // length 1.  So use the first value.
                                mon.plannedEffortCapPercent = percent[0];
                                mon.plannedEffortStyle = style[0];
                            } else {
                                mon.actualEffortCapPercent = percent[0];
                                mon.actualEffortStyle = style[0];
                            }
                        }
                    }
                }

            } else {

                this.project.fixedPriceCosts.forEach(fix => {
                    fix.fixedPriceMonths.forEach(mon => {
                        if (fix.fixedPriceId === Number(cells[1]) && mon.fixedPriceMonthId === Number(cells[2])) {
                            if (this.selectedView === 'Forecast') {
                                mon.plannedCostCapPercent = percent[0];
                                mon.plannedCostStyle = style[0];
                            } else {
                                mon.actualCostCapPercent = percent[0];
                                mon.actualCostStyle = style[0];
                            }

                        }
                    });
                });

            }
            this.updateAllMonthlyTotals.emit();

        }
    }

}
