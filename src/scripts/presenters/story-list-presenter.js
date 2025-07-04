// import { getToken } from '../models/auth-model.js';
import { fetchPoints, deletePoint } from '../models/story-model.js';

export class PointListPresenter {
  constructor() {
    this.view = null;
    this.cachedPoints = [];
  } 

  setView(view) {
      this.view = view;
  }
  
  async onLoginClicked() {
    this.view.navigateTo('#/points');
  }

  async onDeletePointClicked(pointId) {
    try {
      await deletePoint(pointId);
      // After successful deletion, refresh the list
      this.cachedPoints = await fetchPoints();
      this.view.renderPointList(this.cachedPoints);
      alert('Cerita berhasil dihapus.');
    } catch (error) {
      console.error('Error deleting point:', error);
      this.view.renderError('Gagal menghapus cerita: ' + error.message);
    }
  }
  
  async onPageLoad() {
    // cek udah login/blm. Disable dulu
    // const token = getToken(); 
    // if (!token) {
    //   this.view.renderLogin();
    //   return;
    // }
  
    this.view.renderLoading();
    try {
      this.cachedPoints = await fetchPoints();
      this.view.renderPointList(this.cachedPoints);
    } catch (error) {
      this.view.renderError(error.message);
    }
  }

  async onPointSelected(index) {
    const point = this.cachedPoints[index];
    if (!point.latitude || !point.longitude) {
      this.view.showLocationError();
    } else {
      this.view.renderPoint(point);
    }
  }
}


