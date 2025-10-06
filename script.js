/************** SLIDER (Landing) **************/
(function initSlider(){
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length || !dots.length) return;

  let current = 0;
  const show = (i) => {
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  };
  const next = () => { current = (current + 1) % slides.length; show(current); };

  dots.forEach((dot, i) => dot.addEventListener('click', () => { current = i; show(i); }));
  show(0);
  setInterval(next, 4000);
})();

/************** LOGIN **************/
function login() {
  const user = document.getElementById("admin-user")?.value;
  const pass = document.getElementById("admin-pass")?.value;
  if (user === "admin" && pass === "admin123") {
    // bandera de sesión muy simple
    localStorage.setItem("adminLoggedIn", "1");
    window.location.href = "dashboard.html";
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}
function cerrarSesion() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "admin.html";
}

/************** STORAGE HELPERS **************/
function getServicios() {
  return JSON.parse(localStorage.getItem("servicios") || "[]");
}
function saveServicios(arr) {
  localStorage.setItem("servicios", JSON.stringify(arr));
}

/************** DASHBOARD RENDER **************/
(function initDashboard(){
  const tbody = document.getElementById("servicio-body");
  if (!tbody) return; // no estamos en dashboard

  // (opcional) proteger ruta si no hay login
  // if (localStorage.getItem("adminLoggedIn") !== "1") window.location.href = "admin.html";

  const form = document.getElementById("service-form");
  const toggleBtn = document.getElementById("toggle-form");
  const saveBtn = document.getElementById("save-service");
  const cancelBtn = document.getElementById("cancel-edit");

  const fName = document.getElementById("svc-name");
  const fCat  = document.getElementById("svc-category");
  const fPrice= document.getElementById("svc-price");
  const fStock= document.getElementById("svc-stock");
  const fImage= document.getElementById("svc-image");
  const fPromo= document.getElementById("svc-promo");

  let editingIndex = null;

  // Si no hay datos, dejamos algunos de ejemplo para que se vea
  if (!getServicios().length) {
    saveServicios([
      { nombre: "Desarrollo Web Personalizado", categoria: "Desarrollo", precio: 2500, stock: 8,  promocion: true,  estado: true,  imagen: "https://via.placeholder.com/100?text=Web" },
      { nombre: "Estrategia de Marketing Digital", categoria: "Marketing", precio: 1800, stock: 12, promocion: false, estado: true,  imagen: "https://via.placeholder.com/100?text=Mkt" },
      { nombre: "Desarrollo de Software a Medida", categoria: "Desarrollo", precio: 5000, stock: 5,  promocion: true,  estado: true,  imagen: "https://via.placeholder.com/100?text=Soft" },
      { nombre: "Consultoría Empresarial", categoria: "Consultoría", precio: 2200, stock: 0,  promocion: false, estado: false, imagen: "https://via.placeholder.com/100?text=Biz" }
    ]);
  }

  function clearForm() {
    fName.value = "";
    fCat.value = "";
    fPrice.value = "";
    fStock.value = "";
    fImage.value = "";
    fPromo.checked = false;
    editingIndex = null;
    saveBtn.textContent = "Guardar";
  }

  function computeSummary(services) {
    const total = services.length;
    const promo = services.filter(s => s.promocion).length;
    const stockTotal = services.reduce((acc, s) => acc + Number(s.stock || 0), 0);
    const sinStock = services.filter(s => Number(s.stock) === 0).length;

    document.getElementById("total-servicios").textContent = total;
    document.getElementById("promo-servicios").textContent = promo;
    document.getElementById("stock-total").textContent = stockTotal;
    document.getElementById("sin-stock").textContent = sinStock;
  }

  function renderTable() {
    const services = getServicios();
    computeSummary(services);
    tbody.innerHTML = "";

    services.forEach((s, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${s.imagen}" alt="${s.nombre}" /></td>
        <td>${s.nombre}</td>
        <td>${s.categoria}</td>
        <td>$${Number(s.precio).toLocaleString()}</td>
        <td>${s.stock}</td>
        <td>
          ${s.promocion ? '<span class="estado promocion">Promoción</span>' : ''}
          ${s.stock > 0 ? '<span class="estado disponible">Disponible</span>' : ''}
        </td>
        <td class="acciones">
          <button title="Editar" onclick="editService(${i})">✏️</button>
          <button title="Eliminar" onclick="deleteService(${i})">🗑️</button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  // Exponer helpers para los botones de la tabla
  window.deleteService = function(index) {
    const arr = getServicios();
    arr.splice(index, 1);
    saveServicios(arr);
    renderTable();
  };

  window.editService = function(index) {
    const s = getServicios()[index];
    editingIndex = index;
    fName.value = s.nombre;
    fCat.value = s.categoria;
    fPrice.value = s.precio;
    fStock.value = s.stock;
    fImage.value = s.imagen;
    fPromo.checked = !!s.promocion;
    form.style.display = "block";
    saveBtn.textContent = "Actualizar";
  };

  // Toggle form
  toggleBtn.addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "block" : "none";
    if (form.style.display === "none") clearForm();
  });
  cancelBtn.addEventListener("click", () => { clearForm(); form.style.display = "none"; });

  // Guardar/actualizar
  saveBtn.addEventListener("click", () => {
    const name  = fName.value.trim();
    const cat   = fCat.value.trim();
    const price = Number(fPrice.value);
    const stock = Number(fStock.value);
    const image = fImage.value.trim();
    const promo = !!fPromo.checked;

    if (!name || !cat || isNaN(price) || isNaN(stock) || !image) {
      alert("Completa todos los campos correctamente.");
      return;
    }

    const newService = { nombre: name, categoria: cat, precio: price, stock, imagen: image, promocion: promo, estado: stock > 0 };
    const arr = getServicios();

    if (editingIndex === null) {
      arr.push(newService);
    } else {
      arr[editingIndex] = newService;
    }

    saveServicios(arr);
    clearForm();
    form.style.display = "none";
    renderTable();
  });

  renderTable();
})();

/************** SERVICIOS PÚBLICOS (servicios.html) **************/
(function initServiciosPublicos(){
  
  const grid = document.getElementById("services-grid");
  if (!grid) return;

  const inputSearch = document.getElementById("svc-search");
  const selFilter   = document.getElementById("svc-filter");
  const selSort     = document.getElementById("svc-sort");
  const emptyState  = document.getElementById("empty-state");

  // helpers compartidos
  function getServicios(){ try{ return JSON.parse(localStorage.getItem("servicios") || "[]"); }catch{return [];} }
  function saveServicios(arr){ localStorage.setItem("servicios", JSON.stringify(arr)); }

  // Semilla si está vacío (para que siempre veas algo)
  (function seedIfEmpty(){
    if (!getServicios().length) {
      saveServicios([
        { nombre:"Desarrollo Web Personalizado", categoria:"Desarrollo", precio:2500, stock:8,  promocion:true,  estado:true,  imagen:"https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop" , desc:"Sitios web responsivos y modernos diseñados específicamente para tu negocio."},
        { nombre:"Estrategia de Marketing Digital", categoria:"Marketing", precio:1800, stock:12, promocion:false, estado:true,  imagen:"https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1200&auto=format&fit=crop", desc:"Planes completos para aumentar tu presencia online y mejorar conversiones."},
        { nombre:"Desarrollo de Software a Medida", categoria:"Desarrollo", precio:5000, stock:5,  promocion:true,  estado:true,  imagen:"https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop", desc:"Aplicaciones personalizadas que se adaptan a tus procesos."},
        { nombre:"Análisis de Datos Empresariales", categoria:"Análisis", precio:3200, stock:7,  promocion:false, estado:true,  imagen:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", desc:"Transformamos tus datos en insights accionables."},
        { nombre:"Consultoría Empresarial", categoria:"Consultoría", precio:2200, stock:10, promocion:false, estado:true,  imagen:"https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop", desc:"Asesoramiento estratégico para optimizar procesos y reducir costos."},
        { nombre:"Planificación Financiera", categoria:"Finanzas", precio:1500, stock:15, promocion:true,  estado:true,  imagen:"https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop", desc:"Estrategias financieras para crecimiento sostenible."},
        { nombre:"Gestión de Proyectos", categoria:"Gestión", precio:2800, stock:6,  promocion:false, estado:true,  imagen:"https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1200&auto=format&fit=crop", desc:"Coordinación completa de proyectos complejos."},
        { nombre:"Capacitación y Workshops", categoria:"Educación", precio:1200, stock:20, promocion:false, estado:true,  imagen:"https://images.unsplash.com/photo-1556767576-5ec41e3239fa?q=80&w=1200&auto=format&fit=crop", desc:"Programas de capacitación especializados."}
      ]);
    }
  })();

  function applyFilter(list) {
    const q = (inputSearch.value || "").toLowerCase().trim();
    let filtered = list.filter(s => (`${s.nombre} ${s.categoria}`.toLowerCase()).includes(q));

    switch (selFilter.value) {
      case "promo":       filtered = filtered.filter(s => !!s.promocion); break;
      case "disponible":  filtered = filtered.filter(s => Number(s.stock) > 0); break;
      case "sin_stock":   filtered = filtered.filter(s => Number(s.stock) === 0); break;
    }

    switch (selSort.value) {
      case "nombre_asc":  filtered.sort((a,b)=> (a.nombre||"").localeCompare(b.nombre||"")); break;
      case "precio_asc":  filtered.sort((a,b)=> Number(a.precio)-Number(b.precio)); break;
      case "precio_desc": filtered.sort((a,b)=> Number(b.precio)-Number(a.precio)); break;
      case "stock_desc":  filtered.sort((a,b)=> Number(b.stock)-Number(a.stock)); break;
    }
    return filtered;
  }

  function render() {
    const data = applyFilter(getServicios());
    grid.innerHTML = "";

    if (!data.length) {
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    data.forEach(s => {
      const card = document.createElement("article");
      card.className = "service-card";
      card.innerHTML = `
        <div class="image-wrap">
          <img src="${s.imagen}" alt="${s.nombre}">
          ${s.promocion ? '<span class="Ribbon ribbon">Promoción</span>'.replace('Ribbon','ribbon'): ''}
        </div>
        <div class="card-body">
          <div class="card-head">
            <h3 class="card-title" title="${s.nombre}">${s.nombre}</h3>
            <span class="stock">Stock: ${Number(s.stock)||0}</span>
          </div>
          <p class="card-desc">${s.desc || "Servicio profesional."}</p>
          <div class="badges">
            ${Number(s.stock) > 0 ? '<span class="estado disponible">Disponible</span>' : '<span class="estado promocion">Sin stock</span>'}
          </div>
          <div class="card-foot">
            <span class="price">$${Number(s.precio||0).toLocaleString()}</span>
            <button class="btn-detail" onclick="verDetalle('${encodeURIComponent(s.nombre)}')">Ver Detalle</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Simulación de detalle
  window.verDetalle = function(nombre){
    alert("Detalle de servicio: " + decodeURIComponent(nombre));
  };

  inputSearch.addEventListener("input", render);
  selFilter.addEventListener("change", render);
  selSort.addEventListener("change", render);
  render();
})();

/************** NUEVAS FUNCIONES **************/

/**
 * Verifica que los campos del formulario estén completos antes de guardar.
 */
function validateForm() {
  const name = document.getElementById("nombre-servicio")?.value.trim();
  const desc = document.getElementById("descripcion-servicio")?.value.trim();
  if (!name || !desc) {
    showAlert("Completa todos los campos correctamente.", "warning");
    return false;
  }
  return true;
}

/**
 * Carga los datos de un servicio para editarlo.
 * @param {number} id - Índice o identificador del servicio en el array.
 */
function editService(id) {
  const servicios = getServicios();
  const servicio = servicios[id];
  if (!servicio) return;

  document.getElementById("nombre-servicio").value = servicio.nombre;
  document.getElementById("descripcion-servicio").value = servicio.descripcion;

  document.getElementById("save-service").dataset.editId = id;
  showAlert("Servicio cargado para edición.", "info");
}

/**
 * Elimina un servicio por su ID y actualiza la tabla.
 * @param {number} id - Índice del servicio en el array.
 */
function deleteService(id) {
  let servicios = getServicios();
  if (confirm("¿Deseas eliminar este servicio?")) {
    servicios.splice(id, 1);
    saveServicios(servicios);
    renderTable();
    showAlert("Servicio eliminado correctamente.", "success");
  }
}

/**
 * Cambia el modo de visualización del sitio (oscuro / claro).
 */
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");
  const mode = body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", mode);
  showAlert(`Modo ${mode === "dark" ? "oscuro" : "claro"} activado.`, "info");
}

/**
 * Muestra un mensaje de alerta personalizado.
 * @param {string} message - Texto a mostrar.
 * @param {string} type - Tipo de mensaje: success | error | warning | info.
 */
function showAlert(message, type = "info") {
  const alertBox = document.createElement("div");
  alertBox.className = `alert ${type}`;
  alertBox.textContent = message;
  document.body.appendChild(alertBox);

  setTimeout(() => alertBox.remove(), 3000);
}

/**
 * Desplaza la página suavemente hacia la parte superior.
 */
function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function verificarSesion() {
  const usuario = localStorage.getItem("usuarioActivo");

  if (!usuario) {
    alert("Por favor, regístrate o inicia sesión antes de ver los servicios.");
    window.location.href = "login.html"; // cambia a la ruta de tu página de registro/login
    return false;
  }
  return true;
}

/************** MOSTRAR / OCULTAR CONTRASEÑA **************/
(function initPasswordToggle(){
  const passInput = document.getElementById("admin-pass");
  const toggleBtn = document.getElementById("toggle-pass");
  if (!passInput || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isPassword = passInput.type === "password";
    passInput.type = isPassword ? "text" : "password";
    toggleBtn.textContent = isPassword ? "Ocultar contraseña: 🙈" : "Ver contraseña👁️";
  });
})();

function validarLogin() {
  const user = document.getElementById("admin-user").value.trim();
  const pass = document.getElementById("admin-pass").value.trim();

  if (!user || !pass) {
    alert("Por favor, completa todos los campos antes de continuar.");
    return false;
  }
  return true;
}


