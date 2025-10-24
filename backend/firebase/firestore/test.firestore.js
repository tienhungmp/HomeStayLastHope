import { database } from "../../config/firebaseDb.js";
import { collection, query, getDocs } from "firebase/firestore";

const TEST_COLLECTION_NAME = "random-tests";
async function checkFirestoreConnection() {
  try {
    const q = query(collection(database, TEST_COLLECTION_NAME));
    let docSnap = await getDocs(q);
    if (docSnap.empty) {
      return null;
    }

    let returnedData = [];
    docSnap.forEach((doc) => {
      returnedData.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    console.log("Firebase connection SUCCESS");
    return returnedData;
  } catch (error) {
    console.error(error);
  }
}

export { checkFirestoreConnection };
