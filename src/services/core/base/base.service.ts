import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class BaseService<M> {
  public headers = {};
  constructor(public httpClient: HttpClient) {}

  sendGet(url: any): Observable<M> {
    return this.httpClient.get(url).pipe(map((body: any) => body));
  }

  sendPost(url: any, payload: any): Observable<M> {
    return this.httpClient.post(url, payload).pipe(map((body: any) => body));
  }

  sendDelete(url: any): Observable<M> {
    return this.httpClient.delete(url).pipe(map((body: any) => body));
  }

  sendPut(url: any, payload: any): Observable<M> {
    return this.httpClient.put(url, payload).pipe(map((body: any) => body));
  }

  sendPatch(url: any, payload: any): Observable<M> {
    return this.httpClient.patch(url, payload).pipe(map((body: any) => body));
  }

  baseUrl(url: string) {
    return environment.serverUrl + url;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      // console.error("An error occurred:", error.error.message);
    } else {
      if (
        error.status === 401 ||
        error.status === 504 ||
        error.status === 400
      ) {
        return throwError(
          JSON.stringify({
            name: error.error,
            status: error.status,
            message: error.message,
          })
        );
      }
    }
    return throwError(
      JSON.stringify({
        name: error.name,
        status: error.status,
        message: error.message,
      })
    );
  }
}
