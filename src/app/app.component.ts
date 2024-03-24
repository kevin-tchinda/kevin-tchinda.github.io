import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from './services/translation.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, TranslateModule],
})
export class AppComponent {
  constructor(private _translation: TranslationService) {
    this.initialize();
  }

  private initialize(){
    this._translation.setDefaultLanguage();
  }
}
