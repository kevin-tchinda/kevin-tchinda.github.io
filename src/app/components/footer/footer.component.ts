import { Component, OnInit } from '@angular/core';
import { IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    IonText,
  ],
})
export class FooterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
