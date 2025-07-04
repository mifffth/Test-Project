
import { db, API_KEY, API_SECRET, CLOUD_NAME } from '../API/api.env';
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const POINTS_COLLECTION_NAME = 'points';

export async function fetchPoints() {
  try {
    const querySnapshot = await getDocs(collection(db, POINTS_COLLECTION_NAME));
    const points = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return points;
  } catch (error) {
    console.error('Error fetching points:', error);
    throw new Error('Failed to fetch points: ' + error.message);
  }
}

export async function submitPoint(pointData) {
  try {
    const newPointRef = await addDoc(collection(db, POINTS_COLLECTION_NAME), {
      description: pointData.description,
      photoUrl: pointData.photoUrl,
      cloudinaryId: pointData.cloudinaryId,
      type: pointData.type,
      status: pointData.status,
      latitude: pointData.latitude,
      longitude: pointData.longitude,
      createdAt: new Date(),
    });

    return { id: newPointRef.id, ...pointData };
  } catch (error) {
    console.error('Error submitting point:', error);
    throw new Error('Failed to add point: ' + error.message);
  }
}

export async function updatePoint(pointId, updates) {
  try {
    const pointRef = doc(db, POINTS_COLLECTION_NAME, pointId);
    await updateDoc(pointRef, updates);
  } catch (error) {
    console.error('Error updating point:', error);
    throw new Error('Failed to update point: ' + error.message);
  }
}

async function sha1Hash(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deleteFromCloudinary(publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
  const signature = await sha1Hash(signatureBase);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp);
  formData.append('api_key', API_KEY);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  console.log("Cloudinary delete result:", result);

  if (result.result !== 'ok') {
    throw new Error('Cloudinary delete failed: ' + result.result);
  }
}

export async function deletePoint(pointId) {
  try {
    const pointRef = doc(db, POINTS_COLLECTION_NAME, pointId);
    const pointSnapshot = await getDoc(pointRef);

    if (pointSnapshot.exists()) {
      const pointData = pointSnapshot.data();
      const publicId = pointData.cloudinaryId;

      if (publicId) {
        await deleteFromCloudinary(publicId); 
      }
    }

    await deleteDoc(pointRef);
  } catch (error) {
    console.error('Error deleting point:', error);
    throw new Error('Failed to delete point: ' + error.message);
  }
}




