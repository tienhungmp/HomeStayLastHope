import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { database } from "../../config/firebaseDb.js";
import { addRequest } from "./requests.firestore.js";
import { Role } from "../../constants/role.constant.js";
import { RequestAction } from "../../constants/requestAction.constant.js";

const COLLECTION_USERS = "users";

/**
 * create new user in firestore with information from credential.
 * @param {import('firebase/auth').User} user
 * @param {Object} metadata - User metadata
 * @return {Promise<void>}
 */
async function createUser(user, metadata) {
  const docRef = doc(database, COLLECTION_USERS, user.uid);

  // Add `isRequestingHost` if user has the 'host' role
  const isRequestingHost = metadata.roles && metadata.roles.includes("host");

  // Add user to the users collection
  await setDoc(docRef, {
    displayName: user.displayName,
    email: user.email,
    ...metadata,
    ...(isRequestingHost && { isRequestingHost: true }),
  });

  // Add a host approval request if the user is requesting the 'host' role
  if (isRequestingHost) {
    await addRequest({
      date: new Date(),
      target: "user",
      targetId: user.uid,
      actionNeeded: RequestAction.HOST_REQUEST_APPROVAL,
      isResolved: false,
    });
  }
}

/**
 * Get user information by ID.
 * @param {string} userId user UID.
 * @returns {Promise<User>} user object data. Null if not found.
 */
async function getUserById(userId) {
  let user = null;

  const docRef = doc(database, COLLECTION_USERS, userId);

  let docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    user = {
      id: docSnap.id,
      ...docSnap.data(),
    };
  }

  return user;
}

/**
 * Update user's isRequestingHost flag to false
 * @param {string} userId - ID of the user
 * @return {Promise<void>}
 */
async function updateUserRequestingHost(userId) {
  const docRef = doc(database, COLLECTION_USERS, userId);
  await updateDoc(docRef, {
    isRequestingHost: false,
  });
}

/**
 * Remove 'host' role from user's roles array
 * @param {string} userId - ID of the user
 * @return {Promise<void>}
 */
async function removeUserHostRole(userId) {
  const docRef = doc(database, COLLECTION_USERS, userId);
  await updateDoc(docRef, {
    roles: arrayRemove(Role.HOST),
  });
}

/**
 * Update user information by ID.
 * @param {string} userId - ID of the user
 * @param {Object} updates - Object containing updates for the user
 * @returns {Promise<void>}
 */
async function updateUser(userId, updates) {
  const docRef = doc(database, COLLECTION_USERS, userId);

  await updateDoc(docRef, updates);
}

/**
 * Get a paginated list of users sorted by creation date. Filtered by
 * - optionally by role.
 * - optionally by bossId.
 * @param {string} role - Role to filter users by. Accepts an empty string for no filtering.
 * @param {string} bossId - Optional, ID of the boss to filter users by.
 * @param {number} page - Page number (1-indexed).
 * @param {number} pageSize - Number of users per page.
 * @returns {Promise<{users: Array, total: number}>} - Paginated users and total count.
 */
async function getUsers(role, bossId, page = 1, pageSize = 10) {
  const usersRef = collection(database, COLLECTION_USERS);

  let usersQuery = query(usersRef, orderBy("createdAt", "desc"));

  if (role) {
    usersQuery = query(usersQuery, where("roles", "array-contains", role));
  }

  // Check if bossId is provided and filter by it
  if (bossId) {
    usersQuery = query(usersQuery, where("bossId", "==", bossId));
  }

  const querySnapshot = await getDocs(usersQuery);

  const allUsers = [];
  querySnapshot.forEach((doc) => {
    allUsers.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  const startIndex = (page - 1) * pageSize;
  const paginatedUsers = allUsers.slice(startIndex, startIndex + pageSize);

  return {
    users: paginatedUsers,
    total: allUsers.length,
  };
}

/**
 * Get users by a list of user IDs.
 * @param {Array<string>} userIds - Array of user IDs to fetch.
 * @returns {Promise<Array>} - List of user objects.
 */
async function getUsersByIds(userIds) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  const usersRef = collection(database, COLLECTION_USERS);

  const usersQuery = query(usersRef, where("__name__", "in", userIds));

  const querySnapshot = await getDocs(usersQuery);
  const users = [];

  querySnapshot.forEach((doc) => {
    users.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return users;
}

/**
 * Search users by name or phone.
 * @param {string} keyword - Keyword to search by name or phone.
 * @returns {Promise<Array>} - List of user objects that match the keyword.
 */
async function searchUsersByKeyword(keyword) {
  const usersRef = collection(database, COLLECTION_USERS);

  // NOTE: Firebase only support `Prefix` query, therefore, only user with name starts with "keyword" can be found.
  const nameQuery = query(
    usersRef,
    where("name", ">=", keyword),
    where("name", "<=", keyword + "\uf8ff"),
  );
  const phoneQuery = query(usersRef, where("phone", "==", keyword));

  const [nameSnapshot, phoneSnapshot] = await Promise.all([
    getDocs(nameQuery),
    getDocs(phoneQuery),
  ]);

  const users = [];
  nameSnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  phoneSnapshot.forEach((doc) => {
    if (!users.some((user) => user.id === doc.id)) {
      users.push({ id: doc.id, ...doc.data() });
    }
  });

  return users;
}

/**
 * Delete a user by their ID.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<void>} - A promise that resolves when the user is deleted.
 */
async function deleteUser(userId) {
  const docRef = doc(database, "users", userId); // Reference to the user document
  await deleteDoc(docRef);
}

export {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  getUsersByIds,
  updateUser,
  updateUserRequestingHost,
  removeUserHostRole,
  searchUsersByKeyword,
};
