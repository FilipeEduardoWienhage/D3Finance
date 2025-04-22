import { Component } from '@angular/core';
import { NavBarSystemComponent } from '../nav-bar-system/nav-bar-system.component';
import { FooterComponent } from "../../shared/footer/footer.component";

@Component({
  selector: 'app-main-system',
  imports: [NavBarSystemComponent, FooterComponent],
  templateUrl: './main-system.component.html',
  styleUrl: './main-system.component.css'
})
export class MainSystemComponent {

}
