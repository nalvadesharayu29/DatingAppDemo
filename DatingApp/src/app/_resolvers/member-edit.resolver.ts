import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/User';
import { Injectable } from '@angular/core';
import { UserService } from '../_services/User.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class MemberEditResolver implements Resolve<User> {
    constructor(private userService: UserService,
         private router: Router, private alertify: AlertifyService, private authservice: AuthService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<User> {
        return this.userService.getUser(this.authservice.decodedToken.nameid);
    }
}
