import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/User';
import { Injectable } from '@angular/core';
import { UserService } from '../_services/User.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class MessagesResolver implements Resolve<PaginatedResult<Message[]>> {
    pageSize = 5;
    pageNumber = 1;
    messageContainer = 'Unread';

    constructor(private userService: UserService, private router: Router, private alertify: AlertifyService,
        private authService: AuthService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<PaginatedResult<Message[]>> {
        return this.userService.getMessages(this.authService.decodedToken.nameid, this.pageNumber, this.pageSize, this.messageContainer);
    }
}
