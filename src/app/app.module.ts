import { NgModule } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WordCardComponent } from './word-card/word-card.component';
import {HttpClientModule} from "@angular/common/http";
import {IonicModule} from "@ionic/angular";
import { DetailsScreenComponent } from './details-screen/details-screen.component';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
  declarations: [
    AppComponent,
    WordCardComponent,
    DetailsScreenComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    IonicModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
