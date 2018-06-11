import { Injectable, enableProdMode } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { map, filter, scan, catchError} from 'rxjs/operators';
import { observable, Observable, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { JwtModule } from '@auth0/angular-jwt';
import { User } from '../_models/User';

enableProdMode();
@Injectable({
  providedIn: 'root'
})
export class AuthService {
baseUrl = 'http://localhost:5000/api/auth/';
userToken: any;
decodedToken: any;
currentUser: User;
helper = new JwtHelperService();
private photoUrl = new BehaviorSubject<string>('../../assets/user.png');
currentPhotoUrl = this.photoUrl.asObservable();
constructor(private http: Http) { }

changeMemberPhoto(photoUrl: string) {
  this.photoUrl.next(photoUrl);
}

login(model: any) {
  return this.http.post(this.baseUrl + 'login', model, this.requestOptions()).pipe(map((response: Response) => {
    const user = response.json();
    if (user) {
        localStorage.setItem('token', user.tokenString);
        localStorage.setItem('user', JSON.stringify(user.user));
        this.userToken = user.tokenString;
        this.currentUser = user.user;
        this.decodedToken = this.helper.decodeToken( user.tokenString);
        if ( this.currentUser.photoUrl != null) {
          this.changeMemberPhoto(this.currentUser.photoUrl);
         } else {
          this.changeMemberPhoto('../../assets/user.png');
         }
    }
  }
));
}

register(user: User) {
  return this.http.post(this.baseUrl + 'register', user, this.requestOptions());
}

loggedIn() {
   const token = localStorage.getItem('token');
  // return helper.isTokenExpired(token);
  return !!token;
}

private requestOptions() {
  const headers = new Headers({'Content-type': 'application/json'});
  return  new RequestOptions({headers : headers});
}

private handleerror(error: any) {
  const applicationError = error.headers.get('Application-Error');
  if ( applicationError) {
      return Observable.throw(applicationError);
  }
  const serverError = error.json();
  let modelStateError = '';
  if (serverError) {
    for (const key in serverError) {
      if ( serverError[key] ) {
        modelStateError += serverError[key] + '\n';
      }
    }
  }
  return Observable.throw(
    modelStateError || 'server error'
  );
}
}
