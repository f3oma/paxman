import { Injectable } from "@angular/core";
import { Auth, onAuthStateChanged, createUserWithEmailAndPassword, User, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, AuthProvider } from "@angular/fire/auth";
import { collection, CollectionReference, doc, DocumentData, DocumentReference, Firestore, getDoc, setDoc } from "@angular/fire/firestore";
import { BehaviorSubject, Subject } from "rxjs";
import { AuthenticatedUser } from "../models/admin-user.model";
import { AuthenticationConverter } from "../utils/auth-user-model-converter";

@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {

  private authUserData: Subject<AuthenticatedUser | undefined> = new BehaviorSubject<AuthenticatedUser | undefined>(undefined);
  public authUserData$ = this.authUserData.asObservable();

  private authUserCollectionRef: CollectionReference<DocumentData>;

  constructor(private auth: Auth, private firestore: Firestore, private authenticationUserConverter: AuthenticationConverter) {
    this.authUserCollectionRef = collection(this.firestore, 'authenticated_users');
    this.watchAuthState();
  }

  async watchAuthState() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        localStorage.setItem('userData', user.uid);
        const docRef = doc(this.authUserCollectionRef, user.uid).withConverter(this.authenticationUserConverter.getAuthenticationConverter());
        const result = await getDoc(docRef);
        this.authUserData.next(result.data());
      }
    });
  }

  async registerEmailPassword(email: string, password: string): Promise<AuthenticatedUser> {
    // User needs to enter data in order to retrieve an account from the DB and update it.
    return createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('userData', user.uid);
      const docRef = doc(this.authUserCollectionRef, user.uid).withConverter(this.authenticationUserConverter.getAuthenticationConverter());
      let result = await getDoc(docRef);
      let data = result && result.exists() ? result.data() : undefined;
      if (data === undefined) {
        // create new document if one doesn't exist for some reason (they should have one)
        await this.createNewAuthenticatedUserDoc(user.uid, user.email!, docRef);
        result = await getDoc(docRef);
        this.authUserData.next(result.data());
      } else {
        this.authUserData.next(result.data());
      }
      return result.data()!;
    }).catch((error) => {
      console.log(error);
      throw new Error(error.message);
    })
  }

  loginUserEmailPassword(email: string, password: string): Promise<AuthenticatedUser> {
    return signInWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('userData', user.uid);
      const docRef = doc(this.authUserCollectionRef, user.uid).withConverter(this.authenticationUserConverter.getAuthenticationConverter());
      let result = await getDoc(docRef);
      let data = result && result.exists() ? result.data() : undefined;
      if (data === undefined) {
        // create new document if one doesn't exist for some reason (they should have one)
        await this.createNewAuthenticatedUserDoc(user.uid, user.email!, docRef);
        result = await getDoc(docRef);
        this.authUserData.next(result.data());
      } else {
        this.authUserData.next(result.data());
      }
      return result.data()!;
    }).catch((error) => {
      throw error;
    });
  }

  async loginWithGoogle() {
    return await this.authLogin(new GoogleAuthProvider());
  }

  authLogin(provider: AuthProvider): Promise<AuthenticatedUser> {
    return signInWithPopup(this.auth, provider).then(async (res) => {
        const user = res.user;
        localStorage.setItem('userData', user.uid);
        const docRef = doc(this.authUserCollectionRef, user.uid).withConverter(this.authenticationUserConverter.getAuthenticationConverter());
        let result = await getDoc(docRef);
        let data = result && result.exists() ? result.data() : undefined;
        if (data === undefined) {
          // create new document if one doesn't exist for some reason (they should have one)
          await this.createNewAuthenticatedUserDoc(user.uid, user.email!, docRef);
          result = await getDoc(docRef);
          this.authUserData.next(result.data());
        } else {
          this.authUserData.next(result.data());
        }
        return result.data()!;
      })
      .catch((error) => {
        console.log(error);
        throw new Error(error.message);
      });
  }

  async signOutUser(): Promise<void> {
    return await signOut(this.auth);
  }

  private async createNewAuthenticatedUserDoc(firebaseUid: string, email: string, docRef: DocumentReference): Promise<void> {
    const data = {
      id: firebaseUid,
      email,
      roles: []
    }
    return await setDoc(docRef, data);
  }
}

// TODO: Add new fields for login via email / password
// Add registration via email and password
// Add new method to claim your F3 data OR skip
// F3 Data Claim -> look up by F3 name & (email | phone number), if not found send email to paxsupport@f3omaha.com
