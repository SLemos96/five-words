import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  encrytp(data: any): string{
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  decrypt(data: any){
    return atob(data);
  }
}
