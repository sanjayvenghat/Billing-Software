import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locateOutline, eyeOutline, heartOutline, statsChartOutline, shieldCheckmarkOutline, flashOutline, checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon],
})
export class AboutUsComponent implements OnInit {

  counters = [
    { target: 10, current: 0, suffix: '+', label: 'Stores Trust Us' },
    { target: 100, current: 0, suffix: '+', label: 'Bills Generated' },
    { target: 50, current: 0, suffix: '', label: 'Average Rating', display: (v: number) => (v / 10).toFixed(1) + '\u2605' },
    { target: 20, current: 0, prefix: '\u20B9', suffix: '+', label: 'Dues Recovered' },
  ];
  countersStarted = false;

  constructor(private router: Router, private title: Title, private meta: Meta) {
    addIcons({ locateOutline, eyeOutline, heartOutline, statsChartOutline, shieldCheckmarkOutline, flashOutline, checkmarkCircle });
  }

  ngOnInit() {
    this.title.setTitle('About Us | Handy Bill - Billing App for Fresh Mart & Grocery Stores');
    this.meta.updateTag({ name: 'description', content: 'Learn about Handy Bill — the simple, powerful billing app designed for fresh mart and grocery store owners across India.' });
    this.meta.updateTag({ name: 'keywords', content: 'about handy bill, billing app, grocery billing software, fresh mart billing, Indian billing app' });
    setTimeout(() => this.checkVisibility(), 100);
  }

  checkVisibility() {
    const h = window.innerHeight;
    if (!this.countersStarted) {
      const el = document.getElementById('about-stats');
      if (el && el.getBoundingClientRect().top < h - 100) {
        this.startCounters();
      }
    }
    document.querySelectorAll('.reveal').forEach((el) => {
      if (el.getBoundingClientRect().top < h - 80) {
        el.classList.add('visible');
      }
    });
  }

  onScroll() {
    this.checkVisibility();
  }

  startCounters() {
    if (this.countersStarted) return;
    this.countersStarted = true;

    const animate = () => {
      let allDone = true;
      for (const c of this.counters) {
        if (c.current < c.target) {
          allDone = false;
          c.current = Math.min(c.current + Math.ceil(c.target / 40), c.target);
        }
      }
      if (!allDone) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  getCounterDisplay(c: any): string {
    const prefix = c.prefix || '';
    const suffix = c.suffix || '';
    if (c.display) return prefix + c.display(c.current);
    return prefix + c.current.toLocaleString('en-IN') + suffix;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  NavigateToRegisterComponent() {
    this.router.navigate(['/ResisterLogin']);
  }
}
