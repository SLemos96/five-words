import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Word} from "../model/Word";

@Component({
  selector: 'app-word-card',
  templateUrl: './word-card.component.html',
  styleUrls: ['./word-card.component.css']
})
export class WordCardComponent implements OnInit {

  showInfo = false;
  @Input() word?: Word;
  @Output() swipeRightEvent = new EventEmitter<void>();
  @Output() swipeLeftEvent = new EventEmitter<void>();

  onSwipeRight() {
    this.swipeRightEvent.emit();
  }

  onswipeLeft() {
    this.swipeLeftEvent.emit();
  }

  showDetails() {
    this.showInfo = true;
  }

  closeDetails() {
    this.showInfo = false;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
