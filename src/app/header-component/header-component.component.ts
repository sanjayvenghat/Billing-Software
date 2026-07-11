import { Component, OnInit } from '@angular/core';
import {
  IonButtons,
  IonTitle,
  IonToolbar,
  IonAvatar,
  IonChip,
  IonLabel,
  MenuController
} from '@ionic/angular/standalone';
import { Input } from '@angular/core';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.scss'],
  imports: [IonTitle, IonToolbar, IonButtons, IonAvatar, IonChip, IonLabel],
})
export class HeaderComponentComponent implements OnInit {
  @Input() HeaderTitle: string = '';
  constructor(private menuController: MenuController) { }

  ngOnInit() { }

  openMenu() {
    this.menuController.toggle();
  }
}
