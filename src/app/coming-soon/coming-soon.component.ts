import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, arrowBackOutline } from 'ionicons/icons';
import { TranslatePipe } from '../../Service/TranslatePipe';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    TranslatePipe
  ]
})
export class ComingSoonComponent implements OnInit {

  constructor(private router: Router) {
    addIcons({ 'cart-outline': cartOutline, 'arrow-back-outline': arrowBackOutline });
  }

  ngOnInit() { }

  goBack() {
    this.router.navigate(['/GetUserDetails/billing']);
  }
}
