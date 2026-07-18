import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './TranslateService';

@Pipe({
  name: 'translate',
  pure: false, // Make it impure so it automatically updates when the active language changes
  standalone: true
})
export class TranslatePipe implements PipeTransform {
  constructor(private translateService: TranslateService) { }

  transform(value: any): any {
    if (typeof value !== 'string') return value;
    return this.translateService.translate(value);
  }
}
