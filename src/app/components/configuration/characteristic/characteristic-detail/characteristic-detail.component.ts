import { Component, OnInit, OnChanges } from '@angular/core';
import { CharacteristicService } from '../../../../services';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Characteristic } from '../../../../models';
import { CDK_DESCRIBEDBY_HOST_ATTRIBUTE } from '@angular/cdk/a11y';


@Component({
  selector: 'app-characteristic-detail',
  templateUrl: './characteristic-detail.component.html',
  styleUrls: ['./characteristic-detail.component.scss']
})
export class CharacteristicDetailComponent implements OnInit, OnChanges {
  selectedAttribute: number;
  showDeleteAttribute: boolean;
  characteristic: Characteristic;
  attributes: Characteristic[];

  characteristicForm: FormGroup;


  isLoading = false;

  error: any;


  constructor(private characteristicService: CharacteristicService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService

  ) {
    this.createForm();
  }

  ngOnInit() {
    this.getCharacteristic();
  }



  ngOnChanges() {


    this.characteristicForm.reset({
      characteristicId: this.characteristic.characteristicId,
      characteristicName: this.characteristic.characteristicName,
      characteristicDesc: this.characteristic.characteristicDesc,
      parentId: this.characteristic.parentId,
      level: this.characteristic.level,
    });
    if (this.attributes === undefined) {
      this.attributes = new Array<Characteristic>();
    }
    this.setAttributes();
  }

  onSubmit() {
    this.characteristicForm.updateValueAndValidity();
    if (this.characteristicForm.invalid) {
      return;
    }

    const characteristics: Characteristic[] = this.getCharacteristicFromFormValue(this.characteristicForm.value);

    for (const characteristic of characteristics) {
      if (characteristic.characteristicId !== 0) {
        this.characteristicService.update(characteristic.characteristicId, characteristic).subscribe(data => {
        },
          error => {this.toast.error(error, 'Oops');
            console.log(error); });
      } else {

        const newCharacteristic: Characteristic = {
          parentId: characteristic.parentId,
          characteristicId: 0,
          characteristicName: characteristic.characteristicName,
          characteristicDesc: characteristic.characteristicDesc,
          level: characteristic.level,
          lft: 0,
          rgt: 0
        };

        this.characteristicService.create(JSON.stringify(characteristic)).subscribe(data => {
          this.characteristic = data;

        },
        error => {this.toast.error(error, 'Oops');
        console.log(error); });
      }

    }
    this.toast.success('Characteristic has been Added', 'Success');
    this.router.navigate(['/configuration/characteristics']);

  }


  getCharacteristicFromFormValue(formValue: any): Characteristic[] {
    const characteristics = new Array<Characteristic>();
    const characteristic = new Characteristic();

    characteristic.characteristicId = formValue.characteristicId;
    characteristic.characteristicName = formValue.characteristicName;
    characteristic.characteristicDesc = formValue.characteristicDesc;
    characteristic.parentId = formValue.parentId;
    characteristics.push(characteristic);

    formValue.attributes.forEach(element => {
      const attribute = new Characteristic();
      attribute.characteristicId = element.characteristicId;
      attribute.characteristicDesc = element.characteristicDesc;
      attribute.characteristicName = element.characteristicName;
      attribute.parentId = element.parentId;
      characteristics.push(attribute);
    });



    return characteristics;

  }

  createForm() {
    this.characteristicForm = this.fb.group({
      parentId: '',
      characteristicId: '',
      characteristicName: ['', Validators.required],
      characteristicDesc: '',
      level: '',
      attributes: this.fb.array([])
    }
    );
  }


  get characteristicName() {
    return this.characteristicForm.get('characteristicName');
  }

  get characteristicManager() {
    return this.characteristicForm.get('characteristicManager');
  }
  setAttributes() {
    const attributeFGs = this.attributes
      .map(attribute => this.createAttribute(attribute));
    const attributeFormArray = this.fb.array(attributeFGs);

      this.characteristicForm.setControl('attributes', attributeFormArray);
  }

  createAttribute(attribute: Characteristic) {
    return this.fb.group({
      parentId: attribute.parentId,
      characteristicId: attribute.characteristicId,
      characteristicName: [attribute.characteristicName, Validators.required],
      characteristicDesc: attribute.characteristicDesc
    });
  }


  revert() { this.ngOnChanges(); }

  cancel() { this.router.navigate(['/configuration/characteristics']); }




  getCharacteristicList() {
    this.isLoading = true;
    this.characteristicService.getByParentId(this.characteristic.characteristicId).subscribe(
      results => {
        this.attributes = results;
        this.ngOnChanges();
        this.isLoading = false;
      },
      error => this.error = error);
  }



  getCharacteristic() {
    this.isLoading = true;
    this.route.queryParams
      .filter(params => params.characteristicId)
      .subscribe(params => {
        const id = params.characteristicId;
        if (id === '-1') {
          this.characteristic = new Characteristic();
          this.characteristic.characteristicId = 0;
          this.ngOnChanges();
          this.isLoading = false;
        } else {
          this.characteristicService.getOne(id).subscribe(
            results => {
              this.characteristic = results;
              this.getCharacteristicList();
            },
            error => this.error = error
          );
        }
      });
  }
  addAttribute() {
    const attribute = new Characteristic();
    attribute.parentId = this.characteristic.characteristicId;
    attribute.characteristicId = 0;
    const attributes = this.characteristicForm.get('attributes') as FormArray;
    attributes.push(this.createAttribute(attribute));
  }



  confirmDeleteAttribute(index: number) {
    this.selectedAttribute =  index;
    this.showDeleteAttribute = true;
  }

  removeAttribute() {
    const attributes = this.characteristicForm.get('attriubtes') as FormArray;
    attributes.removeAt(this.selectedAttribute);
    this.showDeleteAttribute = false;
  }
}
