import imageCompression from 'browser-image-compression';
import { submitPoint } from '../models/story-model.js';
import { app, trashPoints, cloudinary_URL } from '../API/api.env';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


export class PointAddPresenter {
  constructor() {
    this.view = null;
  }

  setView(view) {
    this.view = view;
  }

  async onPageLoad() {
    this.view.render();
  }

  async uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", trashPoints);
  
    const res = await fetch(`${cloudinary_URL}`, {
      method: "POST",
      body: formData
    });
  
    if (!res.ok) {
      const error = await res.json();
      console.error("Cloudinary error:", error);
      throw new Error('Gagal mengunggah gambar ke Cloudinary');
    }
  
    const data = await res.json();

    return {
      secureUrl: data.secure_url,
      publicId: data.public_id
    };    
  }

  async onSubmitPhoto(photo, formData) {
    if (!photo) {
      this.view.renderSubmitError('Foto wajib diunggah');
      return;
    }

    const options = {
      maxSizeMB: 1, 
      maxWidthOrHeight: 1024,
      useWebWorker: true
    };

    let compressedPhoto;
    try {
      compressedPhoto = await imageCompression(photo, options);
    } catch (compressionErr) {
      this.view.renderSubmitError('Gagal mengompresi foto: ' + compressionErr.message);
      return;
    }

    if (compressedPhoto.size > 1048576) {
      this.view.renderSubmitError('Foto setelah kompresi masih lebih dari 1MB, mohon gunakan kamera web/pilih foto lain');
      return;
    }

    formData.set('photo', compressedPhoto); 

    this.view.showLoadingOverlay('Mengunggah laporan...');

    try {
      const { secureUrl, publicId } = await this.uploadToCloudinary(photo);

      const description = formData.get('description');
      const type = formData.get('type');
      const status = formData.get('status');
      const lat = parseFloat(formData.get('lat'));
      const lon = parseFloat(formData.get('lon'));

      const allowedTypes = ['bank sampah', 'tpa', 'tempat sampah umum'];
      const allowedStatuses = ['aktif', 'tidak aktif'];

      if (!allowedTypes.includes(type.toLowerCase())) {
        this.view.renderSubmitError('Tipe tidak valid. Pilih: bank sampah, TPA, atau tempat sampah umum.');
        return;
      }

      if (!allowedStatuses.includes(status.toLowerCase())) { 
        this.view.renderSubmitError('Status tidak valid. Pilih: aktif atau tidak aktif.');
        return;
      }

      const pointData = {
        description: description,
        photoUrl: secureUrl,
        cloudinaryId: publicId,
        type: type.toLowerCase(),
        status: status.toLowerCase(),
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lon) ? null : lon,
      };

      await submitPoint(pointData);

      this.view.renderSubmitSuccess();
      this.view.navigateTo('#/stories');
    } catch (err) {
      console.error('Error in onSubmitPhoto:', err);
      this.view.renderSubmitError('Gagal menambahkan cerita: ' + err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
}