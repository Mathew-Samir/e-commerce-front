import { Component } from '@angular/core';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-e-commerce',
  imports: [Navbar, Footer, RouterOutlet],
  templateUrl: './e-commerce.html',
  styleUrl: './e-commerce.scss',
})
export class ECommerce {}
