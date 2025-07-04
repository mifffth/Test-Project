import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../API/api.env';
const auth = getAuth(app);

const TOKEN_KEY = 'token';

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    saveToken(token);
    return token;
  } catch (error) {
    throw new Error(error.message || 'Login gagal' + error.message);
  }
}

export async function registerUser(name, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    saveToken(token);

    return {
      token,
      message: 'Pendaftaran berhasil',
      error: false,
    };
  } catch (error) {
    return {
      token: '',
      message: error.message || 'Register gagal',
      error: true,
    };
  }
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
