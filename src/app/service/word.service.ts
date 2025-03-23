import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WordService {

  private translateApiUrl = 'https://api-free.deepl.com/v2/translate';

  constructor(private http: HttpClient) {}

  translate(text: string[], targetLang: string = 'PT-BR'): Observable<any> {
    const body = {
      text: text,
      target_lang: targetLang
    };

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `DeepL-Auth-Key ${environment.deepLApiKey}`);  // Substitua com a variável de ambiente ou com sua chave de API

    console.log(this.translateApiUrl);
    console.log(body);

    return this.http.post(this.translateApiUrl, body, { headers });
  }
}
