// Configuración del broker MQTT
const brokerUrl = 'wss://broker.emqx.io:8084/mqtt'; // URL del broker EMQX
const topic = 'carrito/datos'; // Tema donde el carrito publica datos

let client; // Variable para el cliente MQTT
let ultimoMensajeRecibido = Date.now(); // Variable para rastrear el último mensaje recibido
const tiempoSinDatos = 5000; // Tiempo límite en ms para considerar que no hay datos (5 segundos)

// Referencias a los elementos del DOM
const conectarDispositivoDiv = document.getElementById('conectar-dispositivo');
const estadoConexionEl = document.getElementById('estado-conexion');

// Crear el botón dinámico (Conectar / Desconectar)
let conectarBtn = document.createElement('button');
conectarBtn.id = 'conectar-btn';
conectarBtn.classList.add('btn-primary');
conectarBtn.innerText = 'Conectar';

// Agregar el botón inicial al cuadro
conectarDispositivoDiv.appendChild(conectarBtn);

// Función para actualizar el cuadro con el botón correspondiente
function actualizarCuadroConexion(estado) {
  conectarDispositivoDiv.innerHTML = `
    <h3>Conectar Dispositivo</h3>
    <p>${estado === 'conectado' ? 'Dispositivo conectado exitosamente.' : 'Presiona el botón para iniciar la conexión con el dispositivo.'}</p>
  `;
  const boton = document.createElement('button');
  boton.classList.add('btn-primary');
  if (estado === 'conectado') {
    boton.id = 'desconectar-btn';
    boton.innerText = 'Desconectar';
    boton.addEventListener('click', desconectarBroker);
  } else {
    boton.id = 'conectar-btn';
    boton.innerText = 'Conectar';
    boton.addEventListener('click', conectarBroker);
  }
  conectarDispositivoDiv.appendChild(boton);
}

// Función para conectar al broker MQTT
function conectarBroker() {
  console.log('Intentando conectar al dispositivo...');
  if (estadoConexionEl) {
    estadoConexionEl.innerText = 'Estado de conexión: Conectando...';
  }

  setTimeout(() => {
    if (!client) {
      client = mqtt.connect(brokerUrl);

      // Evento: Conexión exitosa
      client.on('connect', () => {
        console.log('Conectado al broker MQTT');
        if (estadoConexionEl) {
          estadoConexionEl.innerText = 'Estado de conexión: Conectado';
        }

        // Suscribirse al tema
        client.subscribe(topic, (err) => {
          if (!err) {
            console.log(`Suscrito al tema: ${topic}`);
          } else {
            console.error('Error al suscribirse:', err);
          }
        });

        // Cambiar el cuadro al estado conectado
        actualizarCuadroConexion('conectado');
      });

      // Evento: Recepción de mensajes
      client.on('message', (topic, message) => {
        console.log('Mensaje recibido:', message.toString());
        ultimoMensajeRecibido = Date.now(); // Actualizamos el tiempo del último mensaje

        try {
          const datos = JSON.parse(message.toString());
          actualizarDatosEnPantalla(datos); // Actualizar la interfaz con los datos
        } catch (error) {
          console.error('Error al parsear el mensaje:', error);
        }
      });

      // Evento: Error en la conexión
      client.on('error', (err) => {
        console.error('Error de conexión:', err);
        if (estadoConexionEl) {
          estadoConexionEl.innerText = 'Estado de conexión: Error';
        }
      });

      // Evento: Desconexión
      client.on('close', () => {
        console.warn('Desconectado del broker MQTT');
        if (estadoConexionEl) {
          estadoConexionEl.innerText = 'Estado de conexión: Desconectado';
        }

        // Cambiar el cuadro al estado desconectado
        actualizarCuadroConexion('desconectado');
      });

      // Comprobar si no llegan datos en un tiempo determinado
      setInterval(() => {
        if (Date.now() - ultimoMensajeRecibido > tiempoSinDatos) {
          console.warn('No se han recibido datos en los últimos 5 segundos.');
          actualizarDatosEnPantalla({ humedad: 0, temperatura: 0, ph: 0 });
        }
      }, tiempoSinDatos);
    } else {
      console.log('Ya estás conectado al broker.');
    }
  }, 3000); // Retraso simulado de 3 segundos
}

// Función para desconectar del broker MQTT
function desconectarBroker() {
  console.log('Intentando desconectar...');
  if (estadoConexionEl) {
    estadoConexionEl.innerText = 'Estado de conexión: Desconectando...';
  }

  setTimeout(() => {
    if (client) {
      client.end();
      client = null;
      console.log('Desconectado del broker MQTT');
      if (estadoConexionEl) {
        estadoConexionEl.innerText = 'Estado de conexión: Desconectado';
      }

      // Cambiar el cuadro al estado desconectado
      actualizarCuadroConexion('desconectado');
    }
  }, 3000); // Retraso simulado de 3 segundos
}

// Inicializar el cuadro con el estado desconectado
actualizarCuadroConexion('desconectado');

// Función para mostrar datos en la interfaz
function actualizarDatosEnPantalla(datos) {
  const datosRecolectados = document.getElementById('datos-recolectados');
  if (datosRecolectados) {
    datosRecolectados.style.display = 'block';
    document.getElementById('humedad').innerText = datos.humedad + '%';
    document.getElementById('temperatura').innerText = datos.temperatura + '°C';
    document.getElementById('ph').innerText = datos.ph;
  }
}

// Verificar si el usuario está logueado
const loggedIn = localStorage.getItem('loggedIn');
if (!loggedIn) {
  window.location.href = 'index.html';
} else {
  const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
  const userNav = document.getElementById('user-nav');
  if (userNav) {
    userNav.innerHTML = `
      <li><span>Hola, ${usuarioActual.name}</span></li>
      <li><button id="logout-btn" class="btn-primary">Cerrar Sesión</button></li>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('usuarioActual');
      window.location.href = 'index.html';
    });
  }
}
