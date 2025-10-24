import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { database } from "../../config/firebaseDb.js";
import { RequestAction } from "../../constants/requestAction.constant.js";
import {
  removeUserHostRole,
  updateUserRequestingHost,
} from "./users.firestore.js";

const COLLECTION_USERS = "users";
const COLLECTION_REQUESTS = "requests";

/**
 * Add a new request to the Firestore requests collection.
 * @param {Object} request - Request model.
 * @param {string} request.target - Target entity type (e.g., 'user').
 * @param {string} request.targetId - ID of the target entity.
 * @param {string} request.actionNeeded - Action needed (e.g., 'hostApproval').
 * @param {boolean} request.isResolved - Resolution status.
 * @param {Date} request.date - Timestamp of the request.
 * @returns {Promise<void>}
 */
async function addRequest(request) {
  const requestsCollectionRef = collection(database, COLLECTION_REQUESTS);
  await addDoc(requestsCollectionRef, request);
}

/**
 * Approve or reject a request by ID.
 * @param {string} requestId - ID of the request to approve/reject.
 * @param {boolean} isApprove - True to approve, false to reject.
 * @returns {Promise<void>}
 */
async function approveRequest(requestId, isApprove) {
  const requestRef = doc(database, COLLECTION_REQUESTS, requestId);
  const requestSnap = await getDoc(requestRef);

  if (!requestSnap.exists()) {
    throw new Error("Request not found");
  }

  const request = requestSnap.data();

  if (
    request.target === "user" &&
    request.actionNeeded === RequestAction.HOST_REQUEST_APPROVAL
  ) {
    const userRef = doc(database, COLLECTION_USERS, request.targetId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();

    if (isApprove) {
      // Approve the request: Update `isRequestingHost` to false
      await updateUserRequestingHost(request.targetId);
    } else {
      // Reject the request: Remove `host` from `roles`
      if (Array.isArray(userData.roles)) {
        await removeUserHostRole(request.targetId);
      }
    }

    // Update request as resolved
    await updateDoc(requestRef, { isResolved: true });
  }
}

/**
 * Get requests based on query parameters.
 * @param {boolean} isResolved - Filter by resolution status (default: false).
 * @param {string} [target] - Filter by target (e.g., 'user').
 * @param {string} [actionNeeded] - Filter by action needed (e.g., 'hostApproval').
 * @return {Promise<Array>} - Array of matching requests.
 */
async function getRequests(isResolved = false, target, actionNeeded) {
  const requestsRef = collection(database, COLLECTION_REQUESTS);

  const conditions = [where("isResolved", "==", isResolved)];
  if (target) {
    conditions.push(where("target", "==", target));
  }
  if (actionNeeded) {
    conditions.push(where("actionNeeded", "==", actionNeeded));
  }

  const q = query(requestsRef, ...conditions);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export { addRequest, approveRequest, getRequests };
