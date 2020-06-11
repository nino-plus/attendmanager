import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { Group } from 'src/app/interfaces/group';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  myUid = this.authService.uid;
  myDisplayName = this.authService.displayName;
  myPhotoURL = this.authService.photoURL;
  myEmail = this.authService.email;

  ifTarget: boolean;

  targetUser: User;
  targetDisplayName: string;
  targetPhotoURL: string;
  targetEmail: string;
  targetGroups: Group[];

  constructor(
    private authService: AuthService,
    private groupService: GroupService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const uid = params.get('id');
      console.log(uid);
      if (uid === null) {
        this.ifTarget = false;
      } else {
        this.ifTarget = true;
        this.authService.getUser(uid).subscribe((user: User) => {
          console.log(user);
          this.targetUser = user;
          this.targetDisplayName = user.displayName;
          this.targetPhotoURL = user.photoURL;
          this.targetEmail = user.email;
          this.groupService.getMyGroup(uid).subscribe((groups: Group[]) => {
            this.targetGroups = groups;
          });
        });
      }
    });
  }

  ngOnInit(): void {}

  signOut() {
    this.authService.signOut();
  }

  joinGroup(group: Group) {
    this.groupService.joinGroup(this.myUid, group);
  }

  leaveGroup(group: Group) {
    this.groupService.leaveGroup(this.myUid, group);
  }
}
