import { loginUser, saveToken } from '../models/auth-model.js';
import { updateAuthUI } from '../utils/auth-ui.js';

export class LoginPresenter {
  constructor() {
      this.view = null;
  }

  setView(view) {
      this.view = view;
  }

  async onPageLoad() {
    this.view.render();
  }

  async onLoginSubmit(email, password) {
    this.view.showLoadingOverlay("Tunggu sebentar...");
    try {
      const token = await loginUser(email, password);
      saveToken(token);
      
      updateAuthUI();
      this.view.showAlert('Login berhasil!');
      this.view.navigateTo('#/stories');
    } catch (err) {
      this.view.showAlert(err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
}
