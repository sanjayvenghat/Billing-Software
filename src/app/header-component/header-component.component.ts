import { Component, OnInit } from '@angular/core';
import {
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Input } from '@angular/core';
@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.scss'],
  imports: [IonTitle, IonToolbar, IonButtons, IonMenuButton],
})
export class HeaderComponentComponent implements OnInit {
  @Input() HeaderTitle: string = '';
  constructor() { }

  ngOnInit() { }

}
