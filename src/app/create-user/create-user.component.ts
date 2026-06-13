import { Component, OnInit } from '@angular/core';
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
  customerName: String = ""
  constructor(private newUserService: NewUser, private toastr: ToastService, private keysStorage: KEYSSTORAGE) {
    addIcons({ personOutline, mailOutline, lockClosedOutline, callOutline, globeOutline, saveOutline });
  }

  ngOnInit() { }
  AddCustomer() {
    if (!this.customerName) {
      this.toastr.showWarning("Please enter customer name");
      return;
    }
    let customerDetails = {
      CustomerName: this.customerName,
      companyId: this.keysStorage.getItem("CompanyId")
    }
    this.newUserService.AddCustomer(customerDetails).subscribe({
      next: (response: any) => {
        console.log("Customer added:", response);
        this.toastr.showSuccess(response.message || "Customer added successfully");
        this.customerName = ""
      },
      error: (err: any) => {
        console.error("Error adding customer:", err);
        this.toastr.showWarning(err || "Failed to add customer");
      }
    });


  }
}
