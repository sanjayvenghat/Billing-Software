import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, callOutline, globeOutline, saveOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { NewUser } from './new-user';
import { ToastService } from 'src/Service/ToasterService';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';
@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  imports: [IonGrid, IonRow, IonCol, IonInput, IonButton, IonIcon, FormsModule]
})
export class CreateUserComponent implements OnInit {
  @Input() customerName: String = ""
  @Input() phoneNumber: String = ""
  @Output() customerAdded = new EventEmitter<any>();

  constructor(private newUserService: NewUser, private toastr: ToastService, private keysStorage: KEYSSTORAGE) {
    addIcons({ personOutline, mailOutline, lockClosedOutline, callOutline, globeOutline, saveOutline });
  }

  ngOnInit() {
    if (this.customerName && /^\d+$/.test(this.customerName.toString())) {
      this.phoneNumber = this.customerName;
      this.customerName = "";
    }
  }
  AddCustomer() {
    if (!this.customerName) {
      this.toastr.showWarning("Please enter customer name");
      return;
    }
    if (!this.phoneNumber) {
      this.toastr.showWarning("Please enter Valid Mobile Number Before Saving The data");
      return;
    }
    let customerDetails = {
      CustomerName: this.customerName,
      MobileNumber: this.phoneNumber,
      companyId: this.keysStorage.getItem("CompanyId")
    }
    this.newUserService.AddCustomer(customerDetails).subscribe({
      next: (response: any) => {

        this.toastr.showSuccess(response.message || "Customer added successfully");
        this.customerAdded.emit(response);
        this.customerName = ""
        this.phoneNumber = ""
      },
      error: (err: any) => {
        console.error("Error adding customer:", err);
        this.toastr.showWarning(err || "Failed to add customer");
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
