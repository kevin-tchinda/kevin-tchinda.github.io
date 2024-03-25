import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
@Component({
  selector: 'app-my-place',
  templateUrl: './my-place.page.html',
  styleUrls: ['./my-place.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    TranslateModule, 
    HeaderComponent, 
    FooterComponent,
  ],
})
export class MyPlacePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
