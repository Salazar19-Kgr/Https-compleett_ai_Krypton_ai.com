const glow = document.getElementById('glow');
window.addEventListener('pointermove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

const views = {
  login: document.getElementById('view-login'),
  register: document.getElementById('view-register'),
  dashboard: document.getElementById('view-dashboard'),
  assistant: document.getElementById('view-assistant'),
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name].classList.add('active');
}

function enterDashboard(name) {
  document.getElementById('user-name').textContent = name;
  document.getElementById('avatar').textContent = name.charAt(0).toUpperCase();
  showView('dashboard');
}

document.getElementById('go-register').addEventListener('click', (e) => {
  e.preventDefault();
  showView('register');
});
document.getElementById('go-login').addEventListener('click', (e) => {
  e.preventDefault();
  showView('login');
});

document.getElementById('form-login').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  enterDashboard(email.split('@')[0] || 'amigo');
});

document.getElementById('form-register').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  enterDashboard(name || 'amigo');
});

document.querySelectorAll('[data-google]').forEach(btn => {
  btn.addEventListener('click', () => {
    const nombre = prompt('Ingresá el nombre de tu cuenta de Google:');
    enterDashboard(nombre && nombre.trim() ? nombre.trim() : 'amigo');
  });
});

document.getElementById('logout').addEventListener('click', () => {
  showView('login');
});

document.getElementById('go-assistant').addEventListener('click', () => {
  showView('assistant');
});
document.getElementById('back-dashboard').addEventListener('click', () => {
  showView('dashboard');
});

const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('form-chat');
const chatInput = document.getElementById('chat-input');

function addMessage(text, from) {
  const div = document.createElement('div');
  div.className = 'msg ' + (from === 'user' ? 'msg-user' : 'msg-bot');
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

const respuestas = [
  { palabras: ['hola', 'buenas', 'ola'], respuesta: '¡Hola! ¿En qué te puedo ayudar hoy?' },
  { palabras: ['nombre', 'quien sos', 'quién sos'], respuesta: 'Soy un asistente de demostración, creado con HTML, CSS y JS.' },
  { palabras: ['gracias'], respuesta: '¡De nada! Para eso estoy 😊' },
  { palabras: ['chau', 'adios', 'adiós', 'nos vemos'], respuesta: '¡Chau! Que tengas un buen día.' },
];

function respuestaFija(mensaje) {
  const texto = mensaje.toLowerCase();
  for (const item of respuestas) {
    if (item.palabras.some(p => texto.includes(p))) {
      return item.respuesta;
    }
  }
  return null;
}

async function buscarEnWikipedia(consulta) {
  try {
    const busqueda = await fetch(
      `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(consulta)}&format=json&origin=*`
    ).then(r => r.json());

    const primerResultado = busqueda.query.search[0];
    if (!primerResultado) {
      return 'No encontré información sobre eso. Probá preguntar de otra forma.';
    }

    const resumen = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(primerResultado.title)}`
    ).then(r => r.json());

    return resumen.extract || 'Encontré el tema, pero no pude traer un resumen claro.';
  } catch (err) {
    return 'Hubo un problema buscando esa información. Revisá tu conexión e intentá de nuevo.';
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = chatInput.value.trim();
  if (!texto) return;
  addMessage(texto, 'user');
  chatInput.value = '';

  const fija = respuestaFija(texto);
  if (fija) {
    setTimeout(() => addMessage(fija, 'bot'), 400);
    return;
  }

  const pensando = addMessage('Buscando información...', 'bot');
  const respuesta = await buscarEnWikipedia(texto);
  pensando.textContent = respuesta;
});

addMessage('¡Hola! Soy tu asistente. Preguntame lo que quieras y busco la info por vos 🔎', 'bot');
