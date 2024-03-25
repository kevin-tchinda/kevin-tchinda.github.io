import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonTitle, IonToolbar, IonContent, IonImg, IonText, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonCol, IonRow, IonGrid, IonText, IonImg, IonHeader, IonTitle, IonToolbar, IonContent],
  standalone: true,
})
export class HeaderComponent  implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}

  public toMyPlace(){
    return this.router.navigate(['/']);
  }

}
