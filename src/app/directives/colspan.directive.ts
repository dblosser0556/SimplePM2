import { Directive, ElementRef, Renderer, OnInit, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appColspan]'
})
export class ColspanDirective implements OnInit {
  _colSpanCount: string;

  @Input('appColspan') colSpanCount: string;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this._colSpanCount !== this.colSpanCount) {
      const _colSpan = (Number(this.colSpanCount) - 1).toString();
      this.renderer.setElementAttribute(this.el.nativeElement, 'colspan', _colSpan);
      this._colSpanCount = this.colSpanCount;
    }

  }
  constructor(private el: ElementRef, private renderer: Renderer) {}


    ngOnInit() {
      const _colSpan = (Number(this.colSpanCount) - 1).toString();
      this.renderer.setElementAttribute(this.el.nativeElement, 'colspan', _colSpan);
      this._colSpanCount = this.colSpanCount;
    }



}
