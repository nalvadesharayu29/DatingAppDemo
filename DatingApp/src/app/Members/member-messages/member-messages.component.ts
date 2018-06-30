import { Component, OnInit, Input } from '@angular/core';
import { Message } from '../../_models/message';
import { UserService } from '../../_services/User.service';
import { AuthService } from '../../_services/auth.service';
import { AlertifyService } from '../../_services/alertify.service';
import {  tap, map } from 'rxjs/operators';
import { Observable, Subject, pipe } from 'rxjs';
import * as _ from 'underscore';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
@Input() userId: number;
messages: Message[];
newMessage: any = {};

constructor(private userService: UserService, private authService: AuthService, private alertify: AlertifyService) { }

  ngOnInit() {
   // console.log(this.userId, this.messages);
   this.loadMessage();
  }
loadMessage() {
const currentUserId = +this.authService.decodedToken.nameid;
this.userService.getMessageThread(this.authService.decodedToken.nameid, this.userId)
.pipe(
  tap(messages => {
  _.each(messages as any, (message: Message) => {
        if (message.isRead === false && message.recipientId === currentUserId) {
          this.userService.markAsRead(currentUserId, message.id);
        }
    });
}))
.subscribe(messages => {
 this.messages  = messages;
},
error => {
  this.alertify.error(error);
});
}

SendMessage() {
  this.newMessage.recipientId = this.userId;
  this.userService.sendMessage(this.authService.decodedToken.nameid, this.newMessage)
  .subscribe(message => {
    this.messages.unshift(message);
    this.newMessage.content = '';
  }, error => {
    this.alertify.error(error);
  });
}
}
