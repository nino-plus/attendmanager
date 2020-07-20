import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../interfaces/user';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User>;
  uid: string;
  photoURL: string;
  displayName: string;
  email: string;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private snackbar: MatSnackBar
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.db.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.uid = user.uid;
        this.photoURL = user.photoURL;
        this.displayName = user.displayName;
        this.email = user.email;
      } else {
        this.uid = null;
        this.photoURL = null;
        this.displayName = null;
        this.email = null;
      }
    });
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData({
      ...credential.user,
      searchId: this.db.createId(),
      description: `This is ${credential.user.displayName}'s account.`,
      notificationCount: 0,
      covert: false,
      showGroups: true,
      showAttendingEvents: true,
      showAttendedEvents: true,
      showInvitedEvents: true,
      showInvitedGroups: true,
      showWaitingEvents: true,
      showWaitingGroups: true,
      showPayingEvents: true,
      showPayingGroups: true,
    });
  }

  private updateUserData({
    uid,
    searchId,
    displayName,
    email,
    photoURL,
    description,
    notificationCount,
    covert,
    showGroups,
    showAttendingEvents,
    showAttendedEvents,
    showInvitedEvents,
    showInvitedGroups,
    showWaitingEvents,
    showWaitingGroups,
    showPayingEvents,
    showPayingGroups,
  }: User) {
    const userRef: AngularFirestoreDocument<User> = this.db.doc(`users/${uid}`);

    const data = {
      uid,
      searchId,
      displayName,
      email,
      photoURL,
      description,
      notificationCount,
      covert,
      showGroups,
      showAttendingEvents,
      showAttendedEvents,
      showInvitedEvents,
      showInvitedGroups,
      showWaitingEvents,
      showWaitingGroups,
      showPayingEvents,
      showPayingGroups,
    };

    return userRef
      .set(data, { merge: true })
      .then(() => this.router.navigateByUrl(''))
      .then(() => this.snackbar.open('signed in', null, { duration: 2000 }));
  }

  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(['/welcome']);
  }
}
