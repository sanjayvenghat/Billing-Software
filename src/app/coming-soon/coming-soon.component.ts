import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline, arrowBackOutline, downloadOutline } from 'ionicons/icons';
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
  title: string = 'E-Commerce Dashboard';
  description: string = 'We are building a powerful, real-time analytics suite to track your store orders, delivery updates, and customer shopping behavior. Stay tuned for a smarter e-commerce experience!';
  iconName: string = 'cart-outline';

  constructor(private router: Router, private route: ActivatedRoute) {
    addIcons({ 'cart-outline': cartOutline, 'arrow-back-outline': arrowBackOutline, 'download-outline': downloadOutline });
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['title']) this.title = data['title'];
      if (data['description']) this.description = data['description'];
      if (data['iconName']) this.iconName = data['iconName'];
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
