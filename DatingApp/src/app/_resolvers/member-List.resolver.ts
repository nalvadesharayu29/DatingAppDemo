import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../_models/User';
import { Injectable } from '@angular/core';
import { UserService } from '../_services/User.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import {catchError} from 'rxjs/operators';

@Injectable()
export class MemberListResolver implements Resolve<PaginatedResult<User[]>> {
    pageSize = 5;
    pageNumber = 1;

    constructor(private userService: UserService, private router: Router, private alertify: AlertifyService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<PaginatedResult<User[]>> {
        return this.userService.getUsers(this.pageNumber, this.pageSize)
        .pipe(
            catchError(error => {
            this.alertify.error('problem retrieving data');
            this.router.navigate(['/members']);
            return of(null);
        })
    );
    }
}
