export function updateAuthUI() {
  const token = localStorage.getItem('token');
  const loginLink = document.querySelector('a[href="#/login"]');
  const registerLink = document.querySelector('a[href="#/register"]');
  const logoutBtn = document.getElementById('nav-logout');

  if (token) {
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
    logoutBtn.style.display = 'inline';
  } else {
    loginLink.style.display = 'inline';
    registerLink.style.display = 'inline';
    logoutBtn.style.display = 'none';
  }
}
