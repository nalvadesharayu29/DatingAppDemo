import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { User } from '../_models/User';
import { map, filter, scan, catchError} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = environment.apiUrl;

constructor(private http: Http) { }

getUsers(page?: number, itemsPerPage?: number, userParams?: any, likesParam?: string) {
  const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
  let queryString = '?';

  if ( page != null && itemsPerPage != null) {
    queryString += 'pageNumber=' + page + '&pageSize=' + itemsPerPage + '&';
  }

  if (likesParam === 'Likers') {
    queryString += 'Likers=true&';
  }
  if (likesParam === 'Likees') {
    queryString += 'Likees=true&';
  }

  if (userParams != null) {
    queryString +=
    'minAge=' + userParams.minAge +
    '&maxAge=' + userParams.maxAge +
    '&gender=' + userParams.gender +
    '&orderBy=' + userParams.orderBy;
  }

  return this.http.get(this.baseUrl + 'users' + queryString, this.jwt())
    .pipe(map((response: Response) => {
      paginatedResult.result = response.json();

     if (response.headers.get('Pagination') != null) {
        paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
      }
      return paginatedResult;
    })
  );
}

getUser(id): Observable<User> {
  return this.http
  .get(this.baseUrl + 'users/' + id, this.jwt())
  .pipe(map(response => <User>response.json()));
}

Updateuser(id: number, user: User) {
  return this.http.put(this.baseUrl + 'users/' + id, user, this.jwt());
}

setMainPhoto(userId: number, photoId: number) {
  return this.http.post(this.baseUrl + 'users/' + userId + '/photos/' + photoId + '/setMain', {}, this.jwt());
}

deletePhoto(userId: number, photoId: number) {
  return this.http.delete(this.baseUrl + 'users/' + userId + '/photos/' + photoId , this.jwt());
}

sendLike(id: number, recipientId: number) {
  return this.http.post(this.baseUrl + 'users/' + id + '/like/' + recipientId, {}, this.jwt());
}

getMessages(id: number, page?: number, itemsPerPage?: number, messageContainer?: string) {
  const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();
  let queryString = '?MessageContainer=' + messageContainer + '&';

  if (page != null && itemsPerPage != null) {
    queryString += 'pageNumber=' + page + '&pageSize=' + itemsPerPage;
  }

  return this.http.get(this.baseUrl + 'users/' + id + '/messages' + queryString, this.jwt())
  .pipe(map((response: Response) => {
    paginatedResult.result = response.json();

    if (response.headers.get('Pagination') != null) {
      paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
    }

    return paginatedResult;
  }));
}

getMessageThread(id: number, recipientId: number): any {
  return this.http.get(this.baseUrl + 'users/' + id + '/messages/thread/' + recipientId, this.jwt())
  .pipe(map((response: Response) => {
    return response.json();
  }));
}

sendMessage(id: number, message: Message): any {
 return this.http.post(this.baseUrl + 'users/' + id + '/messages', message, this.jwt())
  .pipe(map((response: Response) => {
    return response.json();
  }));
}

deleteMessage(id: number, userId: number) {
  return this.http.post(this.baseUrl + 'users/' + userId + '/messages/' + id, {}, this.jwt());
}

markAsRead(userId: number, messageId: number) {
  return this.http.post(this.baseUrl + 'users/' + userId + '/messages/' + messageId + '/read', {}, this.jwt())
  .subscribe();
}
private jwt() {
  const token = localStorage.getItem('token');
  if (token) {
      const headers = new Headers({'Authorization': 'Bearer ' + token});
      headers.append('Content-type', 'application/json');
      return new RequestOptions({headers: headers});
  }
}

private handleerror(error: any) {
  if (error.staus === 400) {
    return Observable.throw(error.body);
  }
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
