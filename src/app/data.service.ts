import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private REST_API_SERVER = "http://localhost:3000/products";

  public first: string = "";
  public prev: string = "";
  public next: string = "";
  public last: string = "";

  constructor(private httpClient: HttpClient) { }

  parseLinkHeader(header) {
    if (header.length == 0) {
      return ;
    }

    let parts = header.split(',');
    var links = {};

    parts.forEach( p => {
      let section = p.split(';');
      var url = section[0].replace(/<(.*)>/, '$1').trim();
      var name = section[1].replace(/rel="(.*)"/, '$1').trim();

      links[name] = url;
    });

    this.first = links["first"];
    this.prev = links["prev"];
    this.next = links["next"];
    this.last = links["last"];
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown Error!';

    if(error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    }
    else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    window.alert(errorMessage);

    return throwError(errorMessage);
  }

  public sendGetRequestAllRecord() {
    return this.httpClient.get(this.REST_API_SERVER).pipe(retry(3), catchError(this.handleError));
  }

  public sendGetRequest() {

    return this.httpClient.get(this.REST_API_SERVER, { params: new HttpParams({ fromString: "_page=1&_limit=3" }), observe: "response" }).pipe(retry(3), catchError(this.handleError), tap(res => {
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }

  public sendGetRequestToUrl(url: string){
    return this.httpClient.get(url, { observe: "response" }).pipe(retry(3), catchError(this.handleError), tap(res => {
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }

}
