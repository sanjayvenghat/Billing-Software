import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IonInput, IonButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, callOutline, saveOutline, personAddOutline, checkmarkCircle, alertCircleOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { NewUser } from './new-user';
import { ToastService } from 'src/Service/ToasterService';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { TranslateService } from '../../Service/TranslateService';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  imports: [IonInput, IonButton, IonIcon, IonLabel, FormsModule, TranslatePipe]
})
export class CreateUserComponent implements OnInit {
  @Input() customerName: String = ""
  @Input() phoneNumber: String = ""
  @Output() customerAdded = new EventEmitter<any>();
  submitted = false;

  get isValidPhone(): boolean {
    return /^\d{10}$/.test((this.phoneNumber || '').toString().trim());
  }

  constructor(
    private newUserService: NewUser,
    private toastr: ToastService,
    private keysStorage: KEYSSTORAGE,
    private translateService: TranslateService
  ) {
    addIcons({ personOutline, callOutline, saveOutline, personAddOutline, checkmarkCircle, alertCircleOutline });
  }

  ngOnInit() {
    if (this.customerName && /^\d+$/.test(this.customerName.toString())) {
      this.phoneNumber = this.customerName;
      this.customerName = "";
    }
  }
  AddCustomer() {
    this.submitted = true;
    if (!this.customerName) {
      this.toastr.showWarning(this.translateService.translate("Please enter customer name"));
      return;
    }
    if (!this.isValidPhone) {
      this.toastr.showWarning(this.translateService.translate("Please enter Valid Mobile Number Before Saving The data"));
      return;
    }
    let customerDetails = {
      CustomerName: this.customerName,
      MobileNumber: this.phoneNumber,
      companyId: this.keysStorage.getItem("CompanyId")
    }
    this.newUserService.AddCustomer(customerDetails).subscribe({
      next: (response: any) => {

        this.toastr.showSuccess(this.translateService.translate(response.message || "Customer added successfully"));
        this.customerAdded.emit(response);
        this.customerName = ""
        this.phoneNumber = ""
      },
      error: (err: any) => {
        console.error("Error adding customer:", err);
        this.toastr.showWarning(this.translateService.translate(err || "Failed to add customer"));
      }
    });


  }
  validateNumber(event: any) {
    // Get the current value from the input
    const value = event.target.value;

    // Replace any non-digit character (anything not 0-9) with an empty string
    const numericValue = value.replace(/[^0-9]/g, '');

    // Update the input field visually
    event.target.value = numericValue;

    // Update the Angular model
    this.phoneNumber = numericValue;
  }

  clearCreateUserState() {
    this.customerName = "";
    this.phoneNumber = "";
  }
}
