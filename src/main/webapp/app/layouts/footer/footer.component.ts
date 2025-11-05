import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jhi-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export default class FooterComponent {
  currentYear = new Date().getFullYear();
}
