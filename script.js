// Manejo de Modales
const ModalHandler = {
    openModal: (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
      }
    },
    closeModal: (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';
      }
    },
  };
  
  // Mostrar Mensajes
  function showMessage(elementId, message, isSuccess = false) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = 'block';
      element.textContent = message;
      if (isSuccess) {
        element.classList.add('success');
      } else {
        element.classList.remove('success');
      }
    }
  }
  
  // Manejo de Autenticación
  const AuthHandler = {
    registerUser: (name, email, password) => {
      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      if (usuarios.find((usuario) => usuario.email === email)) {
        showMessage('register-message', 'Este correo ya está registrado.');
        return false;
      }
      usuarios.push({ name, email, password });
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      showMessage('register-message', 'Registro exitoso. Ahora puedes iniciar sesión.', true);
      return true;
    },
    loginUser: (email, password) => {
      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      const usuario = usuarios.find((usuario) => usuario.email === email && usuario.password === password);
      if (usuario) {
        localStorage.setItem('loggedIn', true);
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        return usuario;
      }
      return null;
    },
    logoutUser: () => {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('usuarioActual');
      window.location.href = 'index.html';
    },
  };
  
  // Verificar Estado de Sesión
  function checkLoginStatus(redirectIfLoggedOut = false) {
    const loggedIn = localStorage.getItem('loggedIn');
    if (!loggedIn && redirectIfLoggedOut) {
      window.location.href = 'index.html';
    }
    return loggedIn;
  }
  
  // Configuración de Eventos
  
  // Modal Saber Más
  document.getElementById('saber-mas-btn')?.addEventListener('click', () => {
    ModalHandler.openModal('modal-proyecto');
  });
  document.getElementById('cerrar-modal')?.addEventListener('click', () => {
    ModalHandler.closeModal('modal-proyecto');
  });
  window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('modal-proyecto')) {
      ModalHandler.closeModal('modal-proyecto');
    }
  });
  
  // Modal Login/Registro
  document.getElementById('unete-btn')?.addEventListener('click', () => {
    ModalHandler.openModal('modal-login');
  });
  document.getElementById('cerrar-login-modal')?.addEventListener('click', () => {
    ModalHandler.closeModal('modal-login');
  });
  document.getElementById('switch-to-register')?.addEventListener('click', () => {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'block';
  });
  document.getElementById('switch-to-login')?.addEventListener('click', () => {
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
  });
  window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('modal-login')) {
      ModalHandler.closeModal('modal-login');
    }
  });
  
  // Registro
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
  
    if (AuthHandler.registerUser(name, email, password)) {
      setTimeout(() => {
        document.getElementById('switch-to-login').click();
      }, 2000);
    }
  });
  
  // Login
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
  
    const usuario = AuthHandler.loginUser(email, password);
    if (usuario) {
      showMessage('login-message', `¡Bienvenido, ${usuario.name}!`, true);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showMessage('login-message', 'Correo o contraseña incorrectos.');
    }
  });
  
  // Estado de Sesión Activo
  if (checkLoginStatus()) {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer) {
      welcomeContainer.innerHTML = `
        <h2>Bienvenido, ${usuarioActual.name}</h2>
        <button id="logout-btn" class="btn-primary">Cerrar Sesión</button>
      `;
      document.getElementById('logout-btn').addEventListener('click', () => {
        AuthHandler.logoutUser();
      });
    }
  }
  

  