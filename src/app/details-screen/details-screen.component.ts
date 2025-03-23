import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Word} from "../model/Word";

@Component({
  selector: 'app-details-screen',
  templateUrl: './details-screen.component.html',
  styleUrls: ['./details-screen.component.css']
})
export class DetailsScreenComponent implements OnInit {

  @Input() word!: Word;
  @Input() cardArray!:  ElementRef[] | undefined;
  @Input() closeModal!: () => void;
  @Input() useSwipe!: (cardArray: any) => void;

  constructor() { }

  ngOnInit(): void {
  }

}
