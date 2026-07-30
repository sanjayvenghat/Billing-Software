import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import type { ScrollDetail } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calculatorOutline, sparklesOutline, logoGooglePlaystore, barcodeOutline,
  hourglassOutline, scanOutline, barChartOutline, checkmarkCircle,
  logoWhatsapp, star, chevronBack, chevronForward, addOutline,
  removeOutline, downloadOutline, storefrontOutline, receiptOutline,
  cartOutline, closeCircle, arrowForward, peopleOutline,
  shieldCheckmarkOutline, flashOutline, informationCircleOutline,
  starOutline, helpCircleOutline, logInOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonButton],
})
export class LandingComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  whatsappNumber = '919080933196';
  isScrolled = false;
  menuOpen = false;
  activeFaq: number | null = null;
  activeTestimonial = 0;
  private testimonialInterval?: ReturnType<typeof setInterval>;
  autoPlayTestimonials = true;



  // Animated counters
  counters = [
    { target: 10, current: 0, suffix: '+', label: 'Stores Trust Handy Bill' },
    { target: 100, current: 0, suffix: '+', label: 'Bills Generated' },
    { target: 50, current: 0, suffix: '', label: 'Average App Rating', display: (v: number) => (v / 10).toFixed(1) + '\u2605' },
    { target: 20, current: 0, prefix: '\u20B9', suffix: '+', label: 'Pending Bills Recovered' },
  ];
  countersStarted = false;

  testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Owner, Fresh Mart, Chennai',
      text: 'Handy Bill completely changed how we manage billing. The barcode feature is a lifesaver — my staff scans and gets prices instantly when I am away. Pending bill tracking helped us recover 40% more dues in the first month itself. Absolutely worth it.',
    },
    {
      name: 'Priya Sharma',
      role: 'Owner, Green Grocers, Bangalore',
      text: 'I was skeptical at first, but the 3-month free trial convinced me. Now I cannot imagine running my store without it. The pending bills feature alone saves me 10+ hours every week. My team picked it up in minutes with zero training.',
    },
    {
      name: 'Amit Patel',
      role: 'Manager, Daily Fresh, Mumbai',
      text: 'We had issues with pricing arguments between staff and customers. Barcode scanning eliminated that completely. The daily sales reports help me track exactly what is selling. Best decision we made for this year.',
    },
    {
      name: 'Sunita Verma',
      role: 'Owner, Organic Hub, Pune',
      text: 'What impressed me most is how simple it is. I set everything up in one evening. The customer pending bill feature is genius — no more lost sales from forgotten dues. Highly recommend.',
    },
  ];

  faqs = [
    {
      q: 'How does the barcode price lookup actually work?',
      a: 'Simply open the app, point your phone camera at any product barcode, and the price appears instantly. Your workers do not need to memorize prices or call you. The system pulls rates from your own inventory database and works even without internet.',
    },
    {
      q: 'Is there really a 3-month free trial? No hidden charges?',
      a: 'Absolutely. You get full access to all features for 3 full months. No credit card required, no auto-subscription, no hidden fees. If you decide not to continue, you simply stop using it.',
    },
    {
      q: 'Can I track pending bills for each customer separately?',
      a: 'Yes. Every customer gets a dedicated profile. You can see their complete billing history, current outstanding amount, payment due dates, and past payments at a glance. The dashboard shows total pending collections across all customers.',
    },
    {
      q: 'Do my workers need training to use the app?',
      a: 'Not at all. The app is designed with simplicity in mind. Barcode scanning is one-tap — point and scan. Billing takes 3 taps. Most workers become comfortable in under 10 minutes with no technical skills needed.',
    },
    {
      q: 'Can I use Handy Bill on multiple devices at the same store?',
      a: 'Yes. You can log in from any Android device — phone, tablet, or a dedicated device. All data syncs instantly and automatically across devices.',
    },
    {
      q: 'What if I need help or support?',
      a: 'We are available on WhatsApp 7 days a week. Simply tap the WhatsApp icon on our website and we will respond within minutes. We also have a help center with guides and video tutorials.',
    },
  ];

  constructor(private router: Router, private title: Title, private meta: Meta) {
    try {
      addIcons({
        calculatorOutline, sparklesOutline, logoGooglePlaystore, barcodeOutline,
        hourglassOutline, scanOutline, barChartOutline, checkmarkCircle,
        logoWhatsapp, star, chevronBack, chevronForward, addOutline,
        removeOutline, downloadOutline, storefrontOutline, receiptOutline,
        cartOutline, closeCircle, arrowForward, peopleOutline,
        shieldCheckmarkOutline, flashOutline, informationCircleOutline,
        starOutline, helpCircleOutline, logInOutline
      });
    } catch (e) {
      console.error('Icon registration failed:', e);
    }
  }

  ngOnInit() {
    this.title.setTitle('Handy Bill - Billing App for Fresh Mart & Grocery Stores | Barcode Price Lookup');
    this.meta.updateTag({ name: 'description', content: 'Handy Bill is the simplest billing app for Indian fresh mart and grocery stores. Scan barcodes for instant price lookup, track pending bills per customer, and get daily sales reports. Start your 3-month free trial today.' });
    this.meta.updateTag({ name: 'keywords', content: 'billing app, grocery billing software, fresh mart billing, barcode price lookup, pending bill tracker, Indian billing app, kirana store billing, free billing trial' });
    this.meta.updateTag({ name: 'author', content: 'Handy Bill' });
    this.meta.updateTag({ property: 'og:title', content: 'Handy Bill - Billing App for Fresh Mart & Grocery Stores' });
    this.meta.updateTag({ property: 'og:description', content: 'Scan barcodes for instant price lookup. Track pending bills per customer. Get daily reports. Start your 3-month free trial.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://handybill.app' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Handy Bill - Billing App for Fresh Mart & Grocery Stores' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Scan barcodes for instant price lookup. Track pending bills per customer. Start your 3-month free trial.' });
    this.startTestimonialAutoScroll();
    setTimeout(() => this.checkVisibility(), 100);
  }

  ngOnDestroy() {
    clearInterval(this.testimonialInterval);
  }

  startTestimonialAutoScroll() {
    this.testimonialInterval = setInterval(() => {
      if (this.autoPlayTestimonials) {
        this.nextTestimonial();
      }
    }, 4000);
  }

  pauseTestimonials() {
    this.autoPlayTestimonials = false;
  }

  resumeTestimonials() {
    this.autoPlayTestimonials = true;
  }

  onScroll(event?: CustomEvent<ScrollDetail>) {
    const st = event?.detail?.scrollTop ?? 0;
    this.isScrolled = st > 60;

    if (!this.countersStarted) {
      const el = document.getElementById('stats');
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          this.startCounters();
        }
      }
    }

    this.checkVisibility();
  }

  checkVisibility() {
    const h = window.innerHeight;
    document.querySelectorAll('.reveal').forEach((el) => {
      if (el.getBoundingClientRect().top < h - 80) {
        el.classList.add('visible');
      }
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  // ─── Animated Counters ──────────────────────────────────────────────
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

  navigateToAbout() {
    this.router.navigate(['/about-us']);
  }

  navigateToBill() {
    this.router.navigate(['/ResisterLogin']);
  }

  navigateToLogin() {
    this.router.navigate(['/home']);
  }

  openWhatsApp() {
    window.open(`https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent('Get Quote')}`, '_blank');
  }

  downloadPlayStore() {
    window.open('https://play.google.com/store/apps/details?id=com.freshmart.billing', '_blank');
  }

  async scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      await this.content.scrollToPoint(0, el.offsetTop - 72, 300);
    }
  }

  toggleFaq(index: number) {
    this.activeFaq = this.activeFaq === index ? null : index;
  }

  nextTestimonial() {
    this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.activeTestimonial = (this.activeTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
  }
}
