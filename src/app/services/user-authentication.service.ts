import { Injectable } from "@angular/core";
import { Auth, onAuthStateChanged, createUserWithEmailAndPassword, User, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, AuthProvider } from "@angular/fire/auth";
import { collection, CollectionReference, doc, DocumentData, DocumentReference, Firestore, getDoc, getDocs, query, QueryDocumentSnapshot, setDoc, where } from "@angular/fire/firestore";
import { BehaviorSubject, Subject } from "rxjs";
import { AuthenticatedUser, UserRole } from "../models/admin-user.model";
import { AuthenticationConverter } from "../utils/auth-user-model-converter";
import { IClaimUserInfo, IPaxUser, PaxUser } from "../models/users.model";
import { paxUserConverter } from "../utils/pax-model-converter";
import { arrayRemove, arrayUnion, updateDoc, writeBatch } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {

  private authUserData: Subject<AuthenticatedUser | undefined> = new BehaviorSubject<AuthenticatedUser | undefined>(undefined);
  public authUserData$ = this.authUserData.asObservable();

  private authUserCollectionRef: CollectionReference<DocumentData>; // Authenticated User data
  private usersCollectionRef: CollectionReference<DocumentData>; // Users from migration

  constructor(private auth: Auth, private firestore: Firestore, private authenticationUserConverter: AuthenticationConverter) {
    this.authUserCollectionRef = collection(this.firestore, 'authenticated_users').withConverter(this.authenticationUserConverter.getAuthenticationConverter());
    this.usersCollectionRef = collection(this.firestore, 'users').withConverter(paxUserConverter);
    this.watchAuthState();
  }

  async watchAuthState() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        localStorage.setItem('userData', JSON.stringify(user));
        const docRef = doc(this.authUserCollectionRef, user.uid).withConverter(this.authenticationUserConverter.getAuthenticationConverter());
        const resultData = (await getDoc(docRef)).data();
        this.authUserData.next(resultData);
      }
    });
  }

  async registerEmailPassword(email: string, password: string): Promise<AuthenticatedUser> {
    // User needs to enter data in order to retrieve an account from the DB and update it.
    return createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('userData', JSON.stringify(user));
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
      if (error?.message.includes('auth/email-already-in-use')) {
        throw new Error("Email is already in use. You may need to log in.");
      } else if (error?.message.includes('auth/weak-password')) {
        throw new Error("Password should be atleast 6 characters");
      }
      throw new Error(error.message);
    })
  }

  loginUserEmailPassword(email: string, password: string): Promise<AuthenticatedUser> {
    return signInWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('userData', JSON.stringify(user));
      const docRef = doc(this.authUserCollectionRef, user.uid).withConverter(this.authenticationUserConverter.getAuthenticationConverter());
      let result = await getDoc(docRef);
      let data = result.data();
      if (!result.exists()) {
        // create new document if one doesn't exist for some reason (they should have one)
        await this.createNewAuthenticatedUserDoc(user.uid, user.email!, docRef);
        result = await getDoc(docRef);
        this.authUserData.next(result.data());
      } else {
        if (data.paxDataId) {
          const userDocRef = doc(this.usersCollectionRef, data.paxDataId);
          const userData = (await getDoc(userDocRef)).data();
          data.paxData = userData;
        }
        this.authUserData.next(result.data());
      }
      return data;
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
        localStorage.setItem('userData', JSON.stringify(user));
        const docRef = doc(this.authUserCollectionRef, user.uid).withConverter(this.authenticationUserConverter.getAuthenticationConverter());
        let result = (await getDoc(docRef));
        let data = result.data();
        if (!result.exists()) {
          // create new document if one doesn't exist for some reason (they should have one)
          await this.createNewAuthenticatedUserDoc(user.uid, user.email!, docRef);
          const result = (await getDoc(docRef)).data();
          this.authUserData.next(result);
          return data;
        } else {
          if (data.paxDataId) {
            const userDocRef = doc(this.usersCollectionRef, data.paxDataId);
            const userData = (await getDoc(userDocRef)).data();
            data.paxData = userData;
          }
          this.authUserData.next(data);
          return data;
        }
      })
      .catch((error) => {
        console.error(error);
        throw new Error(error.message);
      });
  }

  async signOutUser(): Promise<void> {
    return await signOut(this.auth);
  }

  get isLoggedIn(): boolean {
    const localData = localStorage.getItem('userData') || null;
    if(!localData || localData === 'undefined') {
      return false;
    }
    const user = JSON.parse(localData);
    return (user !== null || user !== "") ? true : false;
  }

  private async createNewAuthenticatedUserDoc(firebaseUid: string, email: string, docRef: DocumentReference): Promise<void> {
    const data = {
      id: firebaseUid,
      email,
      roles: []
    }
    return await setDoc(docRef, data);
  }

  async tryClaimF3Info(user: AuthenticatedUser, claimUserInfo: Partial<IClaimUserInfo>): Promise<Array<PaxUser>> {
    if (user && claimUserInfo) {
      let emailQuery, emailQuerySnapshot, phoneQuery, phoneQuerySnapshot, f3NameQuery, f3NameQuerySnapshot;
      const collectionRef = collection(this.firestore, 'users').withConverter(paxUserConverter);
      const docs = [];
      if (claimUserInfo.email) {
        emailQuery = query(collectionRef, where("email", "==", claimUserInfo.email));
        emailQuerySnapshot = await getDocs(emailQuery);
        docs.push(...emailQuerySnapshot.docs);
      }
      if (claimUserInfo.phoneNumber) {
        phoneQuery = query(collectionRef, where("phoneNumber", "==", claimUserInfo.phoneNumber?.toDashedForm()));
        phoneQuerySnapshot = await getDocs(phoneQuery);
        docs.push(...phoneQuerySnapshot.docs);
      }
      if (claimUserInfo.f3Name) {
        f3NameQuery = query(collectionRef, where("f3NameLowercase", "==", claimUserInfo.f3Name.toLowerCase()));
        f3NameQuerySnapshot = await getDocs(f3NameQuery);
        docs.push(...f3NameQuerySnapshot.docs);
      }
      if (docs.length === 0) {
        return [];
      }
      const docMap: Record<string, QueryDocumentSnapshot> = {};
      const finalDocData = [];
      for (let doc of docs) {
        docMap[doc.id] = doc;
      }
      for (let prop in docMap) {
        finalDocData.push(docMap[prop].data() as PaxUser);
      }
      return finalDocData;
    }
    throw new Error("No claim details defined");
  }

  async completeF3InfoClaim(user: AuthenticatedUser, paxUser: IPaxUser): Promise<void> {
    const authDocRef = doc(this.authUserCollectionRef, user.getId()).withConverter(this.authenticationUserConverter.getAuthenticationConverter());
    const userDocRef = doc(this.usersCollectionRef, paxUser.id);
    const batch = writeBatch(this.firestore);
    
    batch.update(authDocRef, {
      paxDataRef: userDocRef,
      paxDataId: userDocRef.id
    });
    batch.update(userDocRef, {
      authDataId: authDocRef.id
    })
    await batch.commit();
    const result = (await getDoc(authDocRef)).data();
    this.authUserData.next(result);
    return;
  }

  public async promoteRole(userRole: UserRole, paxUserData: IPaxUser) {
    // We need to make sure the user has an auth account
    // Search the user auth collection for paxdataid that matches
    // if none exists, user doesn't have an auth account
    const authQuery = query(this.authUserCollectionRef, where("paxDataId", "==", paxUserData.id));
    const authQueryResult = await getDocs(authQuery);

    if (authQueryResult.empty) {
      throw new Error("User does not have a linked authentication account");
    } else {
      const userDoc = authQueryResult.docs[0];
      const userDocRef = userDoc.ref;
      return await updateDoc(userDocRef, {
        roles: arrayUnion(userRole)
      })
    }
  }

  public async removeRole(userRole: UserRole, paxUserData: IPaxUser) {
    // We need to make sure the user has an auth account
    // Search the user auth collection for paxdataid that matches
    // if none exists, user doesn't have an auth account
    const authQuery = query(this.authUserCollectionRef, where("paxDataId", "==", paxUserData.id));
    const authQueryResult = await getDocs(authQuery);

    if (authQueryResult.empty) {
      // This should not happen if the user has a current role assigned
      throw new Error("User does not have a linked authentication account");
    } else {
      const userDoc = authQueryResult.docs[0];
      const userDocRef = userDoc.ref;
      return await updateDoc(userDocRef, {
        roles: arrayRemove(userRole)
      })
    }
  }

  public async getLinkedAuthData(userId: string) {
    const authQuery = query(this.authUserCollectionRef, where("paxDataId", "==", userId));
    const authQueryResult = await getDocs(authQuery);
    if (authQueryResult.empty) {
      // user doesn't have an auth account
      throw new Error("User does not have a linked authentication account");
    } else {
      const userDoc = authQueryResult.docs[0];
      return userDoc.data() as AuthenticatedUser;
    }
  }

}