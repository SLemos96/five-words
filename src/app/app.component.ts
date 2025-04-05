import {AfterViewInit, Component, ElementRef, NgZone, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Word} from "./model/Word";
import {HammerGestureConfig} from "@angular/platform-browser";
import {GestureController, Gesture, IonCard, Platform} from "@ionic/angular";
import {environment} from "../environments/environment";
import {catchError, concatMap, forkJoin, of} from "rxjs";
import {WordService} from "./service/word.service";
import {CryptoService} from "./service/crypto.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  words: Word[] = [];
  selectedWord?: Word;
  isLoading = true;
  showInfoCard = true;
  detailsModal = false;
  wordsSwiped = 0;
  dayStreak = 0;
  @ViewChildren(IonCard, {read: ElementRef}) cards!: QueryList<ElementRef>;
  @ViewChild('container', { static: false }) card!: ElementRef;
  @ViewChild('page', { static: false }) page!: ElementRef;

  constructor(private http: HttpClient,
              private gestureCtrl: GestureController,
              private plt: Platform,
              private zone: NgZone,
              private wordService: WordService,
              private cryptoService: CryptoService) {}

  ngOnInit() {
    const showInfoCardStorage = localStorage.getItem('showInfoCard');
    if (showInfoCardStorage === null)
      localStorage.setItem('showInfoCard', 'true');
    else
      this.showInfoCard = JSON.parse(showInfoCardStorage);
    this.handleStoragedData();
    this.initWords();
  }

  handleStoragedData(){
    const wordsSwipedStorage = localStorage.getItem('wordsSwiped');
    if (wordsSwipedStorage !== null)
      this.wordsSwiped = JSON.parse(wordsSwipedStorage);

    const dayStreakStorage = localStorage.getItem('dayStreak');
    if (dayStreakStorage !== null)
      this.dayStreak = JSON.parse(dayStreakStorage);
  }

  initWords(){
    const today = new Date();
    const dataUltimoAcesso = localStorage.getItem('tdate');
    const showInfoCardStorage = localStorage.getItem('showInfoCard');
    // if (false){
    if (dataUltimoAcesso !== null && !showInfoCardStorage){
      this.showInfoCard = false;
      localStorage.setItem('showInfoCard', 'false');
    }
    if (dataUltimoAcesso !== null && this.isDatasIguais(today, new Date(dataUltimoAcesso))){
      this.words = JSON.parse(this.cryptoService.decrypt(localStorage.getItem('words')));
      this.isLoading = false;
    } else {
      this.fetchWords();
      this.atualizarStreakDeAcesso(today, dataUltimoAcesso);
      localStorage.setItem('tdate', today.toString());
    }
  }

  atualizarStreakDeAcesso(today: Date, dataUltimoAcesso: string | null){
    if (dataUltimoAcesso === null){
      this.dayStreak = 1;
      this.setDayStreakOnLocalStorage(this.dayStreak.toString());
      return;
    }

    let dataAcessoAnterior = new Date(dataUltimoAcesso);
    dataAcessoAnterior.setDate(dataAcessoAnterior.getDate()+1);

    if(this.isDatasIguais(today, dataAcessoAnterior)){
        this.dayStreak +=1;
    } else {
      this.dayStreak = 1;
    }

    this.setDayStreakOnLocalStorage(this.dayStreak.toString());
  }

  setDayStreakOnLocalStorage(dayStreak: string){
    localStorage.setItem('dayStreak', dayStreak);
  }

  isDatasIguais(date1: Date, date2: Date){
    if (date1.getFullYear() == date2.getFullYear()
      && date1.getMonth() == date2.getMonth()
      && date1.getDay() == date2.getDay())
      return true;
    return false;
  }

  fetchWords() {
    this.http.get<any>(`https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&excludePartOfSpeech=family-name%2Carticle%2Cdefinite-article&maxCorpusCount=-1&minDictionaryCount=10&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=8&api_key=${environment.apiKey}`)
      .subscribe(
        response => {
          let requestArray = response.map((word: any) =>
            this.http.get<any>(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`).pipe(
              catchError(err => {
                console.error(`Erro na requisição ${word.word}: `, err);
                // Retorna um valor default (pode ser null ou um objeto vazio)
                return of([]);
              }))
          );
          forkJoin(requestArray).subscribe({
            next: (results) => {
              // @ts-ignore
              results.some(resultado => {
                if(resultado.length>0)
                  this.words.push(resultado[0]);
                if (this.words.length === 5) return true;
              });
              this.isLoading = false;
              this.applyGestures(100);
              localStorage.setItem('words',this.cryptoService.encrytp(this.words));
            },
            error: (err) => {
              console.error('Erro ao fazer as requisições:', err);
            }
          });
        },
        error => console.error('Erro ao buscar palavras:', error)
      );

  }

  fetchWordDetails(word: string) {
    this.http.get<any>(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .subscribe(
        response => {
          word = response[0];
          this.words.push(response[0]);
        },
        error => console.error('Erro ao buscar detalhes da palavra:', error)
      );
  }

  markAsLearned(word: any) {
    localStorage.setItem('words',this.cryptoService.encrytp(this.words));
    this.wordsSwiped +=1;
    localStorage.setItem('wordsSwiped',this.wordsSwiped.toString());
  }

  markAsNotLearned(word: any) {
    setTimeout(() => {
      this.words.unshift(word);
      setTimeout(() => {
        this.useSwipe(this.cards?.toArray());
      }, 10);
    }, 0);
  }

  ngAfterViewInit(): void {
    this.applyGestures();
  }

  applyGestures(ms: any = 100){
    setTimeout(() => {
      const cardArray = this.cards?.toArray();
      this.useSwipe(cardArray);
    }, 4000);
  }

  useSwipe(cardArray: any){
    for (let i = 0; i < cardArray.length; i++){
      const card = cardArray[i];
      const gesture: Gesture = this.gestureCtrl.create({
        el: card.nativeElement,
        gestureName: 'swipe',
        onStart: ev => {
        },
        onMove:ev => {
          card.nativeElement.style.transform = `translateX(${ev.deltaX}px) rotate(${ev.deltaX/10}deg)`;
          this.RGBProcess(ev.deltaX);

        },
        onEnd: ev => {
          card.nativeElement.style.transition = '.5s ease-out';
          if (card.nativeElement.classList.contains('info-card')){
            if (ev.deltaX > 150) {
              card.nativeElement.style.transform = `translateX(${+this.plt.width() * 2}px) rotate(${ev.deltaX/2}deg)`;
              this.showInfoCard = false;
              localStorage.setItem('showInfoCard', 'false');
            } else if(ev.deltaX < -150){
              card.nativeElement.style.transform = `translateX(${-this.plt.width() * 2}px) rotate(${ev.deltaX/2}deg)`;
              this.showInfoCard = false;
              localStorage.setItem('showInfoCard', 'false');
            } else {
              card.nativeElement.style.transform = '';
            }
          } else {
            if (ev.deltaX > 150) {
              card.nativeElement.style.transform = `translateX(${+this.plt.width() * 2}px) rotate(${ev.deltaX/2}deg)`;
              this.zone.run(() =>{
                this.markAsLearned(this.words.pop());
              })
            } else if(ev.deltaX < -150){
              card.nativeElement.style.transform = `translateX(${-this.plt.width() * 2}px) rotate(${ev.deltaX/2}deg)`;
              this.zone.run(() => {
                this.markAsNotLearned(this.words.pop());
              });
            } else {
              card.nativeElement.style.transform = '';
            }
          }
          this.RGBProcess(0);
        }
      });
      gesture.enable(true);
    };
  }

  openModal(word: any){
    this.selectedWord = word;
  }

  closeModal(){
    this.selectedWord = undefined;
    setTimeout(() => {
      const cardArray = this.cards?.toArray();
      this.useSwipe(cardArray);
    }, 100);
  }

  openDetailsModal(){
    this.detailsModal = true;
  }

  closeDetailsModal(){
    this.detailsModal = false;
  }

  swipeCard(direction: 'left' | 'right') {
    const cardsArray = this.cards.toArray();
    if (cardsArray.length === 0) return;

    const topCard = cardsArray[cardsArray.length - 1].nativeElement;
    const moveX = direction === 'left' ? '-100%' : '100%';

    topCard.style.transition = 'transform 0.3s ease-out';
    topCard.style.transform = `translateX(${moveX}) rotate(${direction === 'left' ? '-20' : '20'}deg)`;
    this.RGBProcess(direction === "left" ? -20 : 20);

    if (topCard.classList.contains('info-card')){
      setTimeout(() => {
        this.showInfoCard = false;
        localStorage.setItem('showInfoCard', 'false');
        this.RGBProcess(0);
      }, 300);
    } else {
      setTimeout(() => {
        if (direction === 'left'){
          this.markAsNotLearned(this.words.pop());
        } else{
          this.markAsLearned(this.words.pop());
        }
        this.RGBProcess(0);
      }, 300);
    }
  }

  playAudio(url?: string) {
    if (url?.length){
      const audio = new Audio(url);
      audio.play();
    }
  }


  RGBProcess(deltaX: number) {
    let percentage = Math.min(Math.abs(deltaX), 1);
    this.card.nativeElement.style.boxShadow = `0px 0px 10px 5px rgba(${deltaX < 0 ? 255 : 0}, ${deltaX > 0 ? 255 : 0}, 0, ${percentage})` ;
    this.page.nativeElement.style.backgroundImage = `linear-gradient(white, rgba(${deltaX < 0 ? 255 : 0}, ${deltaX > 0 ? 255 : 0}, 0, ${percentage/4}))`;
  }
}
