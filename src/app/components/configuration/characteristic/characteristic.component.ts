import { Component, OnInit } from '@angular/core';
import { Characteristic } from '../../../models';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CharacteristicService } from '../../../services';

@Component({
  selector: 'app-characteristic',
  templateUrl: './characteristic.component.html',
  styleUrls: ['./characteristic.component.scss']
})
export class CharacteristicComponent implements OnInit {



  characteristics: Characteristic[];
  selectedCharacteristic: Characteristic;


  error: any;
  isLoading = false;
  showDeleteConf = false;


  constructor(private characteristicService: CharacteristicService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastrService) {
  }

  ngOnInit() {


    this.getList();

  }


  confirmDelete(characteristic: Characteristic) {
    this.selectedCharacteristic = characteristic;
    this.showDeleteConf = true;
  }

  onDelete() {
    this.showDeleteConf = false;
    this.characteristicService.delete(this.selectedCharacteristic.characteristicId)
      .subscribe(x => {
        this.toast.success('Characteristic Deleted');
        this.getList();
      },
        error => this.toast.error(error, 'Oops'));

  }

  getList() {
    this.isLoading = true;
    this.characteristicService.getAll()
      .subscribe(results => {
        const characteristics = results;

        for (const characteristic of characteristics) {

          // get the parent characteristic name if available.
          if (characteristic.parentId !== 0 && characteristic.parentId !== null) {
            for (const parent of characteristics) {
              if (parent.characteristicId === characteristic.parentId) {
                characteristic.parentName = parent.characteristicName;
              }
            }
          }
        }
        // pass the characteristics back to the for and
        this.characteristics = characteristics;
        this.selectedCharacteristic = undefined;
        this.isLoading = false;
      },
        error => this.error = error);
  }

  add() {
    this.router.navigate(['./details'], { queryParams: { characteristicId: -1 }, relativeTo: this.route });
  }

  edit(characteristic: Characteristic) {
    this.router.navigate(['./details'], { queryParams: { characteristicId: characteristic.characteristicId }, relativeTo: this.route });
  }

}
