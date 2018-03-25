import { Component, OnInit, Input } from '@angular/core';
import { GroupBudget, BudgetType } from '../../models';
import { Subject } from 'rxjs/Subject';
//  import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GroupBudgetService} from '../../services';


@Component({
  selector: 'app-group-budget',
  templateUrl: './group-budget.component.html',
  styleUrls: ['./group-budget.component.css']
})
export class GroupBudgetComponent implements OnInit {

  @Input() budgets: GroupBudget[];
  @Input() groupId: number;
  title: string;
  isCapital: boolean;
  onClose: Subject<GroupBudget[]>;
  error: any;

  // budgetDetailsModal: BsModalRef;
  selectedBudget: GroupBudget;
  isLoading = false;
  budgetType: BudgetType;


  constructor(private budgetService: GroupBudgetService,
    // public bsModalRef: BsModalRef,
    // private bsModalService: BsModalService,
    ) {
  }

  ngOnInit() {
    this.onClose = new Subject<GroupBudget[]>();
    if (this.isCapital) {
        this.budgetType = BudgetType.Capital;
        this.title += ' - Capital Budget';
    } else {
        this.title += ' - Expense Budget';
        this.budgetType = BudgetType.Expense;
    }

  }




  onDelete(id: number) {
      if (confirm('Are you sure to delete this record?') === true) {
          this.budgetService.delete(id)
              .subscribe(x => {
                // this.errMsgService.showUserMessage(ToastrType.success, 'Success', 'Budget record has been deleted');
                  this.getList(this.groupId, this.isCapital);
              });
      }
  }

  getList(projectId: number, isCapital: boolean) {
      this.isLoading = true;
      const queryParams = {'$filter': 'ProjectId eq ' + projectId };
      this.budgetService.getList(queryParams)
          .subscribe(results => {
              this.budgets = results;
              this.isLoading = false;
          },
          error => this.error = error);
      this.selectedBudget = undefined;
  }

  addBudget(isCapital: boolean) {
    const _budget = new GroupBudget();
    _budget.groupBudgetId = null;
    _budget.groupId = this.groupId;
    _budget.budgetType = (isCapital) ? BudgetType.Capital : BudgetType.Expense;
    const initialState = {
      budget: _budget
    };
   // this.budgetDetailsModal = this.bsModalService.show(GroupBudgetDetailComponent, { initialState });
    // this.budgetDetailsModal.content.onClose.subscribe(result => {
    //  console.log('results', result);
    //  if (result !== null) {
    //    this.getList(this.groupId, this.isCapital);
   // }
   // });
  }
  edit(budget: GroupBudget) {
      this.selectedBudget = budget;
      const initialState = {
        budget: this.selectedBudget
      };
     // this.budgetDetailsModal = this.bsModalService.show(GroupBudgetDetailComponent, { initialState });
     // this.budgetDetailsModal.content.budget = this.selectedBudget;
     // this.budgetDetailsModal.content.onClose.subscribe(result => {
     //   console.log('results', result);
     //   if (result !== null) {
     //       this.getList(this.groupId, this.isCapital);
     //   }
     // });
  }

  updateList(event: any) {
      this.getList(this.groupId, this.isCapital);
  }

  close() {
      this.onClose.next(this.budgets);
     // this.bsModalRef.hide();

  }


}
