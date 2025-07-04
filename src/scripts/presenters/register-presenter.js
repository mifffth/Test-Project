import { registerUser } from '../models/auth-model.js';

export class RegisterPresenter {
  constructor() {
      this.view = null;
  }

  setView(view) {
      this.view = view;
  }

  onPageLoad() {
    this.view.render();
  }

  async onRegisterSubmit(name, email, password) {
    this.view.showLoadingOverlay("Tunggu sebentar...");
    try {
      const result = await registerUser(name, email, password);
      if (!result.error) {
        this.view.renderRegisterSuccess();
        this.view.navigateTo('#/login');
      } else {
        this.view.renderRegisterError(result.message);
      }
    } catch (error) {
      this.view.renderRegisterError('Gagal mendaftar: ' + error.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
}