import { Directive, ElementRef, HostListener, EventEmitter, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMultiselect]'
})
export class MultiselectDirective {
  clearFlag = false;
  startCell = null;
  dragging = false;
  finalCell = null;
  cntrlPressed = false;
  multiCells = [];

  constructor(private el: ElementRef, private render: Renderer2) {
  }

  @Output() selectedCells = new EventEmitter<any[]>();

  @HostListener('mousedown', ['$event.target', '$event.which']) onMouseDown(el, button) {

    const el1 = this.findTD(el);

    // make sure this is an area of the table we want to select
    if (!el1.classList.contains('ui-state-default')) {
      return;
    }

    this.dragging = true;
    if (!this.cntrlPressed) {
      this.clearCells();
    }


    this.setStartCell(el1);
    this.setRangeArea(this.startCell, el1);

  }

  @HostListener('mouseup', ['$event.target']) onMouseUp(el) {

    if (this.startCell === null) {
      return;
    }
    this.dragging = false;
    this.finalCell = this.findTD(el);
    this.setSelectedCells(this.startCell, this.finalCell);
    this.selectedCells.emit(this.multiCells);
    this.startCell = null;
  }

  @HostListener('mouseenter', ['$event.target']) onMouseEnter(el) {
    if (!this.dragging) {
      return;
    } else {

      this.setRangeArea(this.startCell, el);
    }
  }

  @HostListener('mouseleave', ['$event.target']) onMouseLeave(el) {
    if (this.dragging) {
      this.dragging = false;
      this.startCell = null;
      this.clearCells();
    }
  }

  @HostListener('mouseover', ['$event.target']) onMouseOver(el) {


    if (!this.dragging) {
      return;
    } else {
      const el1 = this.findTD(el);
      if (el1.nodeName === 'TD') {
        this.setRangeArea(this.startCell, el1);
      }
    }
  }

  @HostListener('document:keydown', ['$event']) handleKeyDownEvent(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.cntrlPressed = true;
    }
  }

  @HostListener('document:keyup', ['$event']) handleKeyUpEvent(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.cntrlPressed = false;
    }

    if (event.key === 'Escape') {
      this.clearCells();
    }
  }

  setStartCell(el) {
    this.startCell = el;
  }

  setRangeArea(start, el) {
    if (this.dragging) {
      if (el.classList.contains('ui-state-default')) {
        this.cellsBetween(this.startCell, el).forEach(element => {
          element.classList.add('hover-area');

        });
      } else if (el.classList.contains('hover-area')) {
        this.cellsBetween(this.startCell, el).forEach(elem => {
          elem.classList.remove('hover-area');
        });
      }
    }
  }

  setSelectedCells(start, end) {
    if (start && end) {
      this.cellsBetween(start, end).forEach(el => {
        el.classList.add('eng-selected-item');
        el.classList.remove('hover-area');

        if (this.multiCells.indexOf(el.cellIndex === -1)) {
          this.multiCells.push(el);
        }
      });
  /*     const tableDiv = this.el.nativeElement.parentElement;
     // const selectBounds = this.render.createElement('div');
     // this.render.setStyle(selectBounds, 'position', 'absolute');
    //  this.render.setStyle(selectBounds, 'top', '0px');
    //  this.render.setStyle(selectBounds, 'left', '0px');
    //  this.render.appendChild(tableDiv, selectBounds);

      const topSelect = this.render.createElement('div');
      this.render.setStyle(topSelect, 'background-color', '#781DA0');
      this.render.setStyle(topSelect, 'height', '2px');
      this.render.setStyle(topSelect, 'width', '150px');
      this.render.setStyle(topSelect, 'display', 'block');
      this.render.setStyle(topSelect, 'position', 'absolute');
      this.render.setStyle(topSelect, 'top', '400px');
      this.render.setStyle(topSelect, 'left', '900px');
      this.render.appendChild(tableDiv, topSelect);
 */
    }
  }

  cellsBetween(start, end) {
    const coordsStart = this.getCoords(start);
    const coordsEnd = this.getCoords(end);
    const topLeft = {
      column: Math.min(coordsStart.column, coordsEnd.column),
      row: Math.min(coordsStart.row, coordsEnd.row)
    };

    const bottomRight = {
      column: Math.max(coordsStart.column, coordsEnd.column),
      row: Math.max(coordsStart.row, coordsEnd.row)
    };


    const tds = this.el.nativeElement.querySelectorAll('td');
    return Array.prototype.filter.call(tds, el => {
      const coords = this.getCoords(el);
      return coords.column >= topLeft.column && coords.column <= bottomRight.column &&
        coords.row >= topLeft.row && coords.row <= bottomRight.row;
    });

  }

  clearCells() {
    this.multiCells = [];
    Array.prototype.forEach.call(this.el.nativeElement.querySelectorAll('td'), td => {
      td.classList.remove('eng-selected-item');
      td.classList.remove('hover-area');
    });
  }

  getCoords(cell) {

    return {
      column: cell.cellIndex,
      row: cell.parentElement.rowIndex
    };
  }

  findTD(el) {
    if (el.nodeName === 'TD') {
      return el;
    } else if (el.parentElement.nodeName === 'TD') {
      return el.parentElement;
    } else if (el.parentElement.parentElement.nodeName === 'TD') {

      return el.parentElement.parentElement;
    } else if (el.parentElement.parentElement.parentElement.nodeName === 'TD') {

      return el.parentElement.parentElement.parentElement;
    } else {

      return el;
    }
  }
}
