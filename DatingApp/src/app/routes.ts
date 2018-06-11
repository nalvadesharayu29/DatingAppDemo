import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './Members/member-list/member-list.component';
import { MessagesComponent } from './messages/messages.component';
import { ListsComponent } from './lists/lists.component';
import { AuthGuard } from './_guards/auth.guard';
import { MemberDetailComponent } from './Members/member-detail/member-detail.component';
import { MemberDeatilResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-List.resolver';
import { MemberEditComponent } from './Members/member-edit/member-edit.component';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { ListsResolver } from './_resolvers/lists.resolver';

export const appRouts: Routes = [
    { path: 'home', component: HomeComponent},
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        children: [
            { path: 'members', component: MemberListComponent, resolve: {users: MemberListResolver}},
            {path: 'members/:id', component: MemberDetailComponent, resolve:  { user: MemberDeatilResolver}},
            {path: 'member/edit', component: MemberEditComponent, resolve: {user: MemberEditResolver}},
            { path: 'messages', component: MessagesComponent},
            { path: 'lists', component: ListsComponent, resolve: {user: ListsResolver}},
        ]
    },
  { path: '**', redirectTo: 'home', pathMatch: 'full'}
];
