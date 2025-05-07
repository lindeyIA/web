document.addEventListener('DOMContentLoaded', mostrarLinks);

function mostrarPersonalizada() {
  const select = document.getElementById('categoriaSelect');
  const personalizada = document.getElementById('categoriaInput');
  personalizada.style.display = select.value === 'Otros' ? 'block' : 'none';
}

async function guardarLink() {
  const url = document.getElementById('link').value.trim();
  const select = document.getElementById('categoriaSelect');
  const personalizada = document.getElementById('categoriaInput').value.trim();
  const categoria = select.value === 'Otros' ? (personalizada || 'Otros') : select.value;
  const boton = document.getElementById('btnGuardar');

  if (!url) return alert("Ingresa un enlace válido.");

  const lista = JSON.parse(localStorage.getItem('linksGuardados')) || [];
  if (lista.some(link => link.enlace === url)) {
    alert("⚠️ Este enlace ya fue guardado.");
    return;
  }

  boton.disabled = true;
  boton.innerText = "Guardando...";

  const data = await obtenerMicrolink(url);
  if (!data) {
    alert("No se pudo obtener vista previa.");
    boton.disabled = false;
    boton.innerText = "💾 Guardar";
    return;
  }

  lista.push({
    enlace: url,
    titulo: data.title || url,
    imagen: data.image?.url || 'https://via.placeholder.com/300x180?text=Vista+no+disponible',
    categoria,
    favorito: false,
    fecha: new Date().toLocaleDateString()
  });

  localStorage.setItem('linksGuardados', JSON.stringify(lista));
  document.getElementById('link').value = '';
  document.getElementById('categoriaInput').value = '';
  boton.disabled = false;
  boton.innerText = "💾 Guardar";

  mostrarConfirmacion();
  mostrarLinks();
}

async function obtenerMicrolink(url) {
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    return json.status === 'success' ? json.data : null;
  } catch {
    return null;
  }
}

function mostrarLinks() {
  const lista = JSON.parse(localStorage.getItem('linksGuardados')) || [];
  const contenedor = document.getElementById('links');
  contenedor.innerHTML = '';

  lista.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img class="thumbnail" src="${item.imagen}" alt="miniatura" onerror="this.src='https://via.placeholder.com/300x180?text=No+preview'">
      <div class="card-content">
        <h3><a href="${item.enlace}" target="_blank">${item.titulo}</a></h3>
        <p>${item.categoria} | ${item.fecha}</p>
        <div class="botones">
          <button onclick="toggleFavorito(${index})">${item.favorito ? '⭐' : '☆'}</button>
          <button onclick="compartirLink('${item.enlace}')">📤</button>
          <button onclick="eliminarLink(${index})">🗑️</button>
        </div>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

function toggleFavorito(index) {
  const lista = JSON.parse(localStorage.getItem('linksGuardados')) || [];
  lista[index].favorito = !lista[index].favorito;
  localStorage.setItem('linksGuardados', JSON.stringify(lista));
  mostrarLinks();
}

function eliminarLink(index) {
  const lista = JSON.parse(localStorage.getItem('linksGuardados')) || [];
  lista.splice(index, 1);
  localStorage.setItem('linksGuardados', JSON.stringify(lista));
  mostrarLinks();
}

function compartirLink(enlace) {
  const mensaje = `Mira este enlace: ${enlace}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  const mail = `mailto:?subject=Te comparto un link&body=${encodeURIComponent(mensaje)}`;
  const usarWhatsapp = confirm("¿Compartir por WhatsApp?\n(Cancelar usa correo)");
  window.open(usarWhatsapp ? whatsapp : mail, "_blank");
}

function filtrarLinks() {
  const texto = document.getElementById('buscar').value.toLowerCase();
  const tarjetas = document.querySelectorAll('.card');
  tarjetas.forEach(card => {
    const contenido = card.textContent.toLowerCase();
    card.style.display = contenido.includes(texto) ? 'block' : 'none';
  });
}

function mostrarConfirmacion() {
  const msg = document.createElement('div');
  msg.innerText = "✅ Enlace guardado";
  Object.assign(msg.style, {
    position: "fixed", top: "20px", right: "20px", background: "#2a9d8f",
    color: "white", padding: "10px 20px", borderRadius: "8px", zIndex: "9999"
  });
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}
