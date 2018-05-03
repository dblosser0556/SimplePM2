import { Directive, ElementRef, HostListener, EventEmitter, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMultiselect]'
})
export class MultiselectDirective {
  lastBottomRight = null;
  lastTopLeft = null;
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


    // only respond to left mouse buttons.
    if (button !== 1) { return; }

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
    this.lastBottomRight = null;
    this.lastTopLeft = null;
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

    if (event.key === 'Tab') {
      this.clearCells();
      this.onMouseDown(event.target, null);


    }
  }

 

  setStartCell(el) {
    this.startCell = el;
    this.render.addClass(el, 'start-cell');
  }

  setRangeArea(start, el) {
    if (this.dragging) {

      if (el.classList.contains('ui-state-default')) {

        // handle when the range get smaller.
        const topLeft = this.getTopLeft(start, el);
        if (this.lastTopLeft === null) {
          this.lastTopLeft = topLeft;
        }
        const bottomRight = this.getBottomRight(start, el);
        if (this.lastBottomRight === null) {
          this.lastBottomRight = bottomRight;
        }
        this.cellsBetween(topLeft, bottomRight).forEach(element => {
          // this.render.addClass(element, 'hover-area');
          const coords = this.getCoords(element);
          if (coords.row === topLeft.row) {
            this.render.addClass(element, 'selecting-border-top');
          } else {
            this.render.removeClass(element, 'selecting-border-top');
          }

          if (coords.column === topLeft.column) {
            this.render.addClass(element, 'selecting-border-left');
          } else {
            this.render.removeClass(element, 'selecting-border-left');
          }

          if (coords.row === bottomRight.row) {
            this.render.addClass(element, 'selecting-border-bottom');
          } else {
            this.render.removeClass(element, 'selecting-border-bottom');
          }

          if (coords.column === bottomRight.column) {
            this.render.addClass(element, 'selecting-border-right');
          } else {
            this.render.removeClass(element, 'selecting-border-right');
          }

        });
        // if they user shrinks the area then we must reomve the classes
        // from the area no longer part of the selection.
        // this handles where the uses starts in the bottom and is moving up.
        if (topLeft.column > this.lastTopLeft.column || topLeft.row > this.lastTopLeft.row) {
          let tempBottomRight = { column: bottomRight.column, row: topLeft.row - 1 };
          this.cellsBetween(this.lastTopLeft, tempBottomRight).forEach(element => {
            element.classList.remove('hover-area');
            element.classList.remove('selecting-border-top');
            element.classList.remove('selecting-border-left');
            element.classList.remove('selecting-border-right');
            element.classList.remove('selecting-border-bottom');
          });
          tempBottomRight = { column: topLeft.column - 1, row: bottomRight.row };
          this.cellsBetween(this.lastTopLeft, tempBottomRight).forEach(element => {
            element.classList.remove('hover-area');
            element.classList.remove('selecting-border-top');
            element.classList.remove('selecting-border-right');
            element.classList.remove('selecting-border-left');
            element.classList.remove('selecting-border-bottom');
          });
        }
        // this handles where the user starts at the top and moves down, left or right.
        if (bottomRight.column < this.lastBottomRight.column || bottomRight.row < this.lastBottomRight.row) {
          let tempTopLeft = { column: topLeft.column, row: bottomRight.row + 1 };
          this.cellsBetween(tempTopLeft, this.lastBottomRight).forEach(element => {
            element.classList.remove('hover-area');
            element.classList.remove('selecting-border-bottom');
            element.classList.remove('selecting-border-right');
            element.classList.remove('selecting-border-left');
            element.classList.remove('selecting-border-top');
          });
          tempTopLeft = { column: bottomRight.column + 1, row: topLeft.row };
          this.cellsBetween(tempTopLeft, this.lastBottomRight).forEach(element => {
            element.classList.remove('hover-area');
            element.classList.remove('selecting-border-bottom');
            element.classList.remove('selecting-border-right');
            element.classList.remove('selecting-border-left');
            element.classList.remove('selecting-border-top');
          });
        }
        this.lastTopLeft = topLeft;
        this.lastBottomRight = bottomRight;
      }
    }
  }

  setSelectedCells(start, end) {
    if (start && end) {
      const topLeft = this.getTopLeft(start, end);
      const bottomRight = this.getBottomRight(start, end);
      this.cellsBetween(topLeft, bottomRight).forEach(element => {
        // el.classList.add('eng-selected-item');
        // el.classList.remove('hover-area');

        const coords = this.getCoords(element);

        if (coords.row === topLeft.row) {
          this.render.removeClass(element, 'selecting-border-top');
          this.render.addClass(element, 'selected-border-top');
        }

        if (coords.column === topLeft.column) {
          this.render.addClass(element, 'selected-border-left');
          this.render.removeClass(element, 'selecting-border-left');
        }

        if (coords.row === bottomRight.row) {
          this.render.addClass(element, 'selected-border-bottom');
          this.render.removeClass(element, 'selecting-border-bottom');
        }

        if (coords.column === bottomRight.column) {
          this.render.addClass(element, 'selected-border-right');
          this.render.removeClass(element, 'selecting-border-right');
        }

        if (this.multiCells.indexOf(element.cellIndex === -1)) {
          this.multiCells.push(element);
        }
      });
    }
  }


  setCopyCellRange(selectedCells) {
    // find the topLeft cell.
    const topLeft = this.getTopLeftfromSelectedCells(selectedCells);
    // find the bottom rightcell.
    const bottomRight = this.getBottomRightfromSelectedCells(selectedCells);
    // set the boarders for the selected cells.
    this.cellsBetween(topLeft, bottomRight).forEach(element => {
      // el.classList.add('eng-selected-item');
      // el.classList.remove('hover-area');

      const coords = this.getCoords(element);

      if (coords.row === topLeft.row) {
        this.render.addClass(element, 'copy-border-top');
        this.render.removeClass(element, 'selected-border-top');
      }

      if (coords.column === topLeft.column) {
        this.render.addClass(element, 'copy-border-left');
        this.render.removeClass(element, 'selected-border-left');
      }

      if (coords.row === bottomRight.row) {
        this.render.addClass(element, 'copy-border-bottom');
        this.render.removeClass(element, 'selected-border-bottom');
      }

      if (coords.column === bottomRight.column) {
        this.render.addClass(element, 'copy-border-right');
        this.render.removeClass(element, 'selected-border-right');
      }
    });

  }
  getTopLeft(start, end) {
    const coordsStart = this.getCoords(start);
    const coordsEnd = this.getCoords(end);
    const topLeft = {
      column: Math.min(coordsStart.column, coordsEnd.column),
      row: Math.min(coordsStart.row, coordsEnd.row)
    };
    return topLeft;
  }

  getTopLeftfromSelectedCells(selectedCells) {
    // set the rows large as we are looking for the smallest row and column.
    let topRow = 1000000000000000;
    let topCol = 100000000000000;
    selectedCells.forEach(cell => {
      const coords = this.getCoords(cell);
        if (topRow > coords.row) {
          topRow = coords.row;
        }
        if (topCol > coords.column) {
          topCol = coords.column;
        }
    });
    return {row: topRow, column: topCol};

  }


  getBottomRight(start, end) {
    const coordsStart = this.getCoords(start);
    const coordsEnd = this.getCoords(end);

    const bottomRight = {
      column: Math.max(coordsStart.column, coordsEnd.column),
      row: Math.max(coordsStart.row, coordsEnd.row)
    };
    return bottomRight;
  }

  getBottomRightfromSelectedCells(selectedCells) {
    // set the seeds small as we are looking for the largest row and column.
    let topRow = -1;
    let topCol = -1;
    selectedCells.forEach(cell => {
      const coords = this.getCoords(cell);
        if (topRow < coords.row) {
          topRow = coords.row;
        }
        if (topCol < coords.column) {
          topCol = coords.column;
        }
    });
    return {row: topRow, column: topCol};

  }

  cellsBetween(topLeft, bottomRight) {



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
      this.render.removeClass(td, 'start-cell');
      this.render.removeClass(td, 'selecting-border-top');
      this.render.removeClass(td, 'selecting-border-bottom');
      this.render.removeClass(td, 'selecting-border-left');
      this.render.removeClass(td, 'selecting-border-right');
      this.render.removeClass(td, 'selected-border-top');
      this.render.removeClass(td, 'selected-border-bottom');
      this.render.removeClass(td, 'selected-border-left');
      this.render.removeClass(td, 'selected-border-right');
      this.render.removeClass(td, 'copyarea-border-top');
      this.render.removeClass(td, 'copyarea-border-bottom');
      this.render.removeClass(td, 'copyarea-border-left');
      this.render.removeClass(td, 'copyarea-border-right');
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
