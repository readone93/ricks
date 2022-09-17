import { Message } from "./../../classes/models/message";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "./../../core/base/base.service";
import { Injectable } from "@angular/core";

const routes = {
  message: "message",
};

@Injectable({
  providedIn: "root",
})
export class MessagingService extends BaseService<any> {
  constructor(http: HttpClient) {
    super(http);
  }

  getMessages(): Observable<any> {
    return this.sendGet(this.baseUrl(routes.message));
  }

  sendMessage(payload: Message): Observable<any> {
    return this.sendPost(this.baseUrl(`${routes.message}/store`), payload);
  }

  messagesSent(): Observable<any> {
    return this.sendGet(this.baseUrl(`${routes.message}/sent`));
  }

  messagesReceived(): Observable<any> {
    return this.sendGet(this.baseUrl(`${routes.message}/receive`));
  }

  getSentMessageById(msgId: number): Observable<any> {
    return this.sendGet(this.baseUrl(`${routes.message}/sent/${msgId}`));
  }

  getReceivedMessageById(msgId: number): Observable<any> {
    return this.sendGet(this.baseUrl(`${routes.message}/receive/${msgId}`));
  }
}
