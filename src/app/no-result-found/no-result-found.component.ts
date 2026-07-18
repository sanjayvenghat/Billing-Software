import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { NoResultsFound } from './no-results-found';
import { TranslatePipe } from '../../Service/TranslatePipe';

@Component({
  selector: 'app-no-result-found',
  templateUrl: './no-result-found.component.html',
  styleUrls: ['./no-result-found.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TranslatePipe]
})
export class NoResultFoundComponent implements OnInit, OnDestroy {
  image: string = '';
  isLoading: boolean = true;

  constructor(
    private NoResultsFound: NoResultsFound,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.fetchErrorImage();
  }

  fetchErrorImage() {
    this.isLoading = true;
    this.NoResultsFound.GetErrorstatusResponse().subscribe({
      next: (res: Blob) => {
        if (this.image && this.image.startsWith('blob:')) {
          URL.revokeObjectURL(this.image);
        }
        this.image = URL.createObjectURL(res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching error image:', err);
        this.image = 'https://http.cat/404';
        this.isLoading = false;
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy() {
    if (this.image && this.image.startsWith('blob:')) {
      URL.revokeObjectURL(this.image);
    }
  }
}

