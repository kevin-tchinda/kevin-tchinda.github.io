import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';

const LANG_KEY = 'USER_DEFAULT_LANGUAGE';

@Injectable({
  providedIn: 'root'
})

export class TranslationService {

  constructor(private translate: TranslateService, private storage: StorageService, private http: HttpClient) { }

  public setDefaultLanguage(){
    let language = this.translate.getBrowserLang() || 'en';
    if(language != 'fr'){
      this.translate.setDefaultLang('en');
      this.storage.store(LANG_KEY, 'en');
    }else{
      this.translate.setDefaultLang('fr');
      this.storage.store(LANG_KEY, 'fr');
    }
  }

  public setLanguage(language: string){
    this.translate.use(language);
    this.storage.store(LANG_KEY, language);
  }

  public getLanguage(){
    return this.translate.getDefaultLang();
  }

  public async getStoredLanguage(key: string){
    return await this.storage.get(key)
  }

  public loadTranslations(){
    return new TranslateHttpLoader(this.http, '../../assets/i18n', '.json');
  }
}
