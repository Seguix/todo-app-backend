import {db} from "../../../../config/firebase.js";
import {User} from "../../domain/user.js";
import {UserRepository} from "../../domain/user.repository.js";

const USERS_COLLECTION = "users";

export class FirestoreUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await db.collection(USERS_COLLECTION)
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data() as Omit<User, "id">;

    return {id: doc.id, ...data};
  }

  async create(email: string): Promise<User> {
    const payload: Omit<User, "id"> = {
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    const doc = await db.collection(USERS_COLLECTION).add(payload);
    return {id: doc.id, ...payload};
  }
}
