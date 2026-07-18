import { Component, OnInit, DoCheck, Input } from '@angular/core';
import {
  IonButtons,
  IonTitle,
  IonToolbar,
  IonAvatar,
  IonChip,
  IonLabel,
  MenuController
} from '@ionic/angular/standalone';
import { TranslatePipe } from '../../Service/TranslatePipe';
import { KEYSSTORAGE } from 'src/Service/LocalStorage';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.scss'],
  imports: [IonTitle, IonToolbar, IonButtons, IonAvatar, IonChip, IonLabel, TranslatePipe],
})
export class HeaderComponentComponent implements OnInit, DoCheck {
  @Input() HeaderTitle: string = '';
  avatarUrl: string = 'assets/icon/store.png';
  storeName: string = 'Sakthistores';

  private lastIconType: string | null = null;
  private lastStoreName: string | null = null;

  constructor(
    private menuController: MenuController,
    private keysStorage: KEYSSTORAGE
  ) { }

  ngOnInit() {
    this.loadStoreSettings();
  }

  ngDoCheck() {
    const iconType = this.keysStorage.getItem('IconType');
    const savedStoreName = this.keysStorage.getItem('StoreName');

    if (iconType !== this.lastIconType || savedStoreName !== this.lastStoreName) {
      this.lastIconType = iconType;
      this.lastStoreName = savedStoreName;
      this.loadStoreSettings();
    }
  }

  loadStoreSettings() {
    const iconType = this.keysStorage.getItem('IconType');
    const savedStoreName = this.keysStorage.getItem('StoreName');

    if (savedStoreName) {
      this.storeName = savedStoreName;
    }

    const iconsMap: { [key: string]: string } = {
      'FirstIcon': 'assets/icon/store.png',
      'SecondIcon': 'assets/icon/store (2).png',
      'ThirdIcon': 'assets/icon/store (3).png',
      'DefaultIcon': 'assets/icon/default.png'
    };

    if (iconType && iconsMap[iconType]) {
      this.avatarUrl = iconsMap[iconType];
    } else {
      this.avatarUrl = 'assets/icon/store.png';
    }
  }

  openMenu() {
    this.menuController.toggle();
  }
}
