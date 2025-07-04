export class LoginView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    this.container.innerHTML = `
    <div style="display: flex; height: 100vh; font-family: 'Poppins', sans-serif;">   
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px;">
          <h2 style="font-weight: 700; font-size: 24px; margin-bottom: 24px;">MASUK</h2>
          <p style="color: #676767; margin-bottom: 24px;">Silahkan masuk dengan akun anda</p>
          <form id="login-form" 
          tabindex="-1" 
          role="main"
          class="login-form" 
          style="width: 100%; 
          max-width: 320px;">
          <a href="#login-form" 
          class="skip-link">Lewati ke konten utama
          </a>
            <div style="margin-bottom: 16px;">
            <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder="Email@email.com" 
                aria-label="Masukkan alamat email anda" 
                autocomplete="email"
                style="width: 100%; padding: 12px 16px; background: #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
                required />
            </div>
            <div style="margin-bottom: 16px;">
              <label for="password">Kata sandi</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                placeholder="Password" 
                aria-label="Masukkan password/sandi anda" 
                autocomplete="current-password"
                style="width: 100%; padding: 12px 16px; background:  #dfdfdf; border: none; border-radius: 12px; font-size: 14px;" 
                required />
            </div>
            <div style="text-align: center;">
              <button 
                type="submit" 
                style="padding: 12px 24px; background:#2563eb; color: white; border: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                Masuk
              </button>
            </div>
          </form>
  
          <div style="margin-top: 32px; width: 100%; max-width: 320px;">
            <hr style="margin: 24px 0;">
            <p style="text-align: center; font-weight: 600;">Belum punya akun?</p>
            <div style="margin-top: 16px;">
              <button 
                id="register-btn" aria-label="Daftar akun baru"
                style="width:100%; padding: 12px 24px; background:#2563eb; display: flex; align-items: center; justify-content: center; color: white; border: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                Daftar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    gsap.from('.login-form', {
      y: 50,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    });

    const mainContent = document.querySelector('#login-form');
    const skipLink = document.querySelector('.skip-link');

    skipLink.addEventListener('click', function (event) {
      event.preventDefault(); 
      skipLink.blur(); 
      mainContent.focus(); 
      mainContent.scrollIntoView(); 
    });
    
    const form = this.container.querySelector('#login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      this.presenter.onLoginSubmit(email, password);
    });

    const registerBtn = this.container.querySelector('#register-btn');
    registerBtn.addEventListener('click', () => {
      this.presenter.onRegisterClicked();
    });
  }

  renderLoginSuccess() {
    alert('Login berhasil!');
  }

  renderLoginError(message) {
    alert(message);
  }

  showLoadingOverlay(text) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.textContent = text;
    document.body.appendChild(this.overlay);
    gsap.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  }

  hideLoadingOverlay() {
    if (this.overlay) {
      gsap.to(this.overlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => this.overlay.remove()
      });
    }
  }
  
  showAlert(message) {
    alert(message);
  }
  
  navigateTo(hash) {
    window.location.hash = hash;
  }

}
