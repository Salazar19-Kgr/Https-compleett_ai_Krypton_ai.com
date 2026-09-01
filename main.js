const GEMINI_API_KEY = "AIzaSyBMbttyxddHx21CpYpdh-l51ceITcqmDAc";

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

document.getElementById('go-register').addEventListener('click', (e) => { e.preventDefault(); showView('register'); });
document.getElementById('go-login').addEventListener('click', (e) => { e.preventDefault(); showView('login'); });
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
document.getElementById('logout').addEventListener('click', () => showView('login'));
document.getElementById('go-assistant').addEventListener('click', () => showView('assistant'));
document.getElementById('back-dashboard').addEventListener('click', () => showView('dashboard'));

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

async function preguntarGemini(mensaje) {
  try {
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: mensaje }] }]
        })
      }
    ).then(r => r.json());

    return respuesta.candidates?.[0]?.content?.parts?.[0]?.text
      || "No pude generar una respuesta. Probá de nuevo.";
  } catch (err) {
    return "Hubo un problema conectando con la IA. Revisá tu conexión.";
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = chatInput.value.trim();
  if (!texto) return;
  addMessage(texto, 'user');
  chatInput.value = '';
  const pensando = addMessage('Pensando...', 'bot');
  const respuesta = await preguntarGemini(texto);
  pensando.textContent = respuesta;
});

addMessage('¡Hola! Soy tu asistente con IA real. Preguntame lo que quieras 🤖', 'bot');
