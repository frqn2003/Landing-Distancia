const navButton = document.getElementById("menu-button");
const menu = document.getElementById("navbar-menu");

let isMenuOpen = false;

function toggleMenu() {
  isMenuOpen = !isMenuOpen;

  if (isMenuOpen) {
    // Abrir menú con animación
    menu.classList.remove('hidden');
    // Forzar un reflow para que la transición funcione
    menu.offsetHeight;
    menu.classList.add('menu-open');
  } else {
    // Cerrar menú con animación
    menu.classList.remove('menu-open');
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      if (!isMenuOpen) {
        menu.classList.add('hidden');
      }
    }, 300); // Duración de la transición
  }
}

navButton.addEventListener("click", toggleMenu);

const menuLinks = menu.querySelectorAll('a');
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (isMenuOpen) {
      toggleMenu();
    }
  });
});

document.addEventListener('click', (event) => {
  const clickDentroMenu = menu.contains(event.target);
  const clickEnBoton = navButton.contains(event.target);

  if (!clickDentroMenu && !clickEnBoton && isMenuOpen) {
    toggleMenu()
  }
});

/* --------------------- Variables globales ----------------------------- */
const containerCarreras = document.getElementById("listaCarreras");
const containerFiltros = document.getElementById("filtros");
const searchInput = document.getElementById("search-bar");
const containerFiltrosArea = document.getElementById("filtros-categoria");

const isMobile = window.innerWidth < 1300;

let textoBusqueda = "";
let filtroActivo = null;
let filtrosActivos = [];
let filtrosAreaActivos = [];

/* --------------------- Inicialización principal ----------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  // 1. Cargar datos de landing (promociones, tarjetas)
  initLandingData();

  // 2. Cargar datos de carreras y modalidades
  initCarrerasData();

  // 3. Inicializar carruseles
  initCarousels();

  // 4. Inicializar formulario
  initFormulario();

  // 5. Inicializar componente potencia
  initPotencia();

});

/* --------------------- Datos de landing ----------------------------- */
function initLandingData() {
  fetch('assets/datosLanding.json')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar el JSON');
      return response.json();
    })
    .then(json => {
      const elementoPromocion = document.getElementById('promo');
      const datosTarjeta = json.tarjeta;

      function generarTarjetas() {
        const tarjetasActivas = datosTarjeta
          .filter(tarjeta => tarjeta.activa === true)
          .sort((a, b) => a.orden - b.orden)

        const contenedorTarjetas = document.getElementById('aranceles')

        if (contenedorTarjetas) {
          contenedorTarjetas.innerHTML = ''

          tarjetasActivas.forEach(tarjeta => {
            const divTarjeta = document.createElement('div')
            divTarjeta.id = `tarjeta${tarjeta.id.charAt(0).toUpperCase() + tarjeta.id.slice(1)}`;
            divTarjeta.innerHTML = `
            <div class="flex flex-col items-center justify-center gap-3 mb-5 text-center">
              <img class="md:w-1/4 w-1/2 p-4 bg-white rounded-2xl" src="${tarjeta.imagen}" alt="${tarjeta.nombre}">
              <p class="md:text-base text-xs">${tarjeta.descripcion}</p>
            </div> `
            contenedorTarjetas.appendChild(divTarjeta)
          })
        }
      }

      generarTarjetas();

      let index = 0;

      function obtenerPromocionActiva() {
        const fechaActual = new Date();
        const promocionActiva = json.promociones_dinamicas.find(promocion => {
          const fechaInicio = new Date(promocion.fecha_inicio);
          const fechaFin = new Date(promocion.fecha_fin);
          return fechaActual >= fechaInicio && fechaActual <= fechaFin;
        });
        return promocionActiva ? promocionActiva.mensajes : json.promocion_fallback;
      }

      const promociones = obtenerPromocionActiva();
      elementoPromocion.innerHTML = promociones[index];

      function cambiarTexto() {
        index = (index + 1) % promociones.length;
        elementoPromocion.innerHTML = promociones[index];
      }

      setInterval(cambiarTexto, 2500);
    })
    .catch(error => {
      console.error('Error al cargar las promociones:', error);
      const elementoPromocion = document.getElementById('promo');
      if (elementoPromocion) {
        elementoPromocion.innerHTML = "&#127942;Construí<span class='text-sm font-extrabold lg:text-lg'>&nbsp;<strong>tu historia</strong></span>";
      }
    });
}

/* --------------------- Datos de carreras y modalidades ----------------------------- */
function initCarrerasData() {
  fetch('assets/datosCarreras.json')
    .then((response) => response.json())
    .then((json) => {
      let careers = json.careers;
      careers = careers.filter(carreras => carreras.modalidad.includes(7));

      let filtros = json.filtros
      filtros = filtros.filter(filtro => filtro.id != "1");

      let filtrosArea = json.filtrosArea
      filtrosArea = filtrosArea.filter(filtro => filtro != "Ciencias Agrarias y Veterinarias" && filtro != "Artes" && filtro != "Idiomas");

      let modalidades = json.modalidades
      modalidades = modalidades.filter(modalidad => modalidad.id === 7);
      const carrerasElegidas = careers
        .filter(carrera => carrera.modalidad.includes(7))
        .sort((a, b) => b.estudiantes - a.estudiantes)
        .slice(0, 4);
      // Función helper para manejar estilos de botones
      function toggleButtonStyle(button, isActive) {
        button.classList.remove("bg-white", "bg-[#D6001C]", "text-white", "text-gray-700");
        button.offsetHeight;

        if (isActive) {
          button.classList.add("bg-[#D6001C]", "text-white");
        } else {
          button.classList.add("bg-white");
        }

        requestAnimationFrame(() => {
          button.offsetHeight;
        });
      }

      function filtrosRender() {
        containerFiltros.innerHTML = filtros.map(filter => `
          <button class="cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-[8px] bg-white border-2 border-gray-200 md:hover:bg-[#D6001C] md:hover:text-white md:text-base text-xs transition-colors" id="boton-filtro"
            data-filter="${filter.id}">
            <span>${filter.nombre}</span>
          </button>
        `).join('');

        containerFiltrosArea.innerHTML = filtrosArea.map(filter => `
          <button class="cursor-pointer flex items-center space-x-2 px-2 md:px-4 py-2 rounded-[8px] bg-white border-2 border-gray-200 md:hover:bg-[#D6001C] md:hover:text-white md:text-base text-xs transition-colors w-full" id="filtro-area-btn"
            data-filter="${filter}">
            <span>${filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
          </button>
        `).join('');

        // Event listeners para filtros principales
        const botones = containerFiltros.querySelectorAll("#boton-filtro");
        botones.forEach(button => {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            handleFilterClick(e.currentTarget.dataset.filter, e.currentTarget, 'main');
          });
        });

        // Event listeners para filtros de área
        const botonesArea = containerFiltrosArea.querySelectorAll("#filtro-area-btn");
        botonesArea.forEach(button => {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            handleFilterClick(e.currentTarget.dataset.filter, e.currentTarget, 'area');
          });
        });

        setupFiltersDropdown();
        setTimeout(() => {
          updateAllFilterStates();
        }, 10);
      }

      function handleFilterClick(filterId, buttonElement, filterType) {
        if (filterType === 'main') {
          if (filtrosActivos.includes(filterId)) {
            filtrosActivos = filtrosActivos.filter(filtro => filtro !== filterId);
          } else {
            filtrosActivos.push(filterId);
          }
        } else if (filterType === 'area') {
          if (filtrosAreaActivos.includes(filterId)) {
            filtrosAreaActivos = filtrosAreaActivos.filter(filtro => filtro !== filterId);
          } else {
            filtrosAreaActivos.push(filterId);
          }
        }

        updateAllFilterStates();
        updateActiveFiltersCount();
        renderCarreras();
      }

      function updateAllFilterStates() {
        const botonesDesktop = containerFiltros.querySelectorAll("#boton-filtro");
        botonesDesktop.forEach(btn => {
          const isActive = filtrosActivos.includes(btn.dataset.filter);
          toggleButtonStyle(btn, isActive);
        });

        const botonesAreaDesktop = containerFiltrosArea.querySelectorAll("#filtro-area-btn");
        botonesAreaDesktop.forEach(btn => {
          const isActive = filtrosAreaActivos.includes(btn.dataset.filter);
          toggleButtonStyle(btn, isActive);
        });
      }

      function setupFiltersDropdown() {
        const FiltersBtn = document.getElementById("filters-btn");
        const FiltersDropdown = document.getElementById("filters-dropdown");
        const FiltersArrow = document.getElementById("filters-arrow");
        const clearAllBtn = document.getElementById("clear-all-filters");
        const aplicarFiltros = document.getElementById("aplicar-filtros")

        if (!FiltersBtn || !FiltersDropdown) return;

        FiltersBtn.addEventListener("click", () => {
          const isHidden = FiltersDropdown.classList.contains("hidden");

          if (isHidden) {
            FiltersDropdown.classList.remove("hidden");
            FiltersArrow.style.transform = "rotate(180deg)";
          } else {
            FiltersDropdown.classList.add("hidden");
            FiltersArrow.style.transform = "rotate(0deg)";
          }
        });

        aplicarFiltros.addEventListener("click", () => {
          const isHidden = FiltersDropdown.classList.contains("hidden");
          if (!isHidden) {
            FiltersDropdown.classList.add("hidden")
            FiltersArrow.style.transform = "rotate(0deg)";
          }
        })

        clearAllBtn?.addEventListener("click", () => {
          filtrosActivos = [];
          filtrosAreaActivos = [];
          updateAllFilterStates();
          updateActiveFiltersCount();
          renderCarreras();
        });

        document.addEventListener("click", (e) => {
          if (!FiltersBtn.contains(e.target) && !FiltersDropdown.contains(e.target)) {
            FiltersDropdown.classList.add("hidden");
            FiltersArrow.style.transform = "rotate(0deg)";
          }
        });
      }

      function updateActiveFiltersCount() {
        const activeCount = filtrosActivos.length + filtrosAreaActivos.length;
        const countElement = document.getElementById("active-filters-count");

        if (countElement) {
          if (activeCount > 0) {
            countElement.textContent = activeCount;
            countElement.classList.remove("hidden");
          } else {
            countElement.classList.add("hidden");
          }
        }
      }

      function renderCarreras() {
        let carrerasFiltradas = [...careers];

        function normalizeText(text) {
          return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }

        if (textoBusqueda.trim() !== "") {
          const textoNormalizado = normalizeText(textoBusqueda);
          carrerasFiltradas = carrerasFiltradas.filter(career => {
            const nombreNormalizado = normalizeText(career.nombre);
            const descripcionNormalizada = normalizeText(career.descripcion);

            return nombreNormalizado.includes(textoNormalizado) ||
              descripcionNormalizada.includes(textoNormalizado);
          });
        }

        if (filtrosActivos.length > 0) {
          carrerasFiltradas = carrerasFiltradas.filter(career => {
            return filtrosActivos.every(filtroId => {
              const filtro = filtros.find(f => f.id === filtroId);
              if (!filtro) return false;

              switch (filtro.filterType) {
                case 'popular':
                  return career.popular === true;
                case 'destacada':
                  return career.destacada === true; 
                case 'modalidad':
                  return career.modalidad.includes(filtro.value);
                /* case 'duracion':
                  const durationMatch = career.duracion.match(/(\d+)/);
                  const careerYears = durationMatch ? parseInt(durationMatch[1]) : 0;
                  return careerYears <= filtro.maxYears; */
                default:
                  return false;
              }
            });
          });
        }

        if (filtrosAreaActivos.length > 0) {
          carrerasFiltradas = carrerasFiltradas.filter(career => {
            return filtrosAreaActivos.some(areaId => {
              const categoryNormalized = normalizeText(career.categoria);
              const areaIdNormalized = normalizeText(areaId);
              return categoryNormalized.includes(areaIdNormalized) ||
                areaIdNormalized.includes(categoryNormalized);
            });
          });
        }

        function obtenerNombreModalidad(modalidades) {
          if (modalidades.includes(7)) return 'Online'
        }

        if (carrerasFiltradas.length === 0) {
          containerCarreras.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 px-6 text-center">
              <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">
                  No se encontraron carreras
                </h3>
                <p class="text-gray-600 mb-4">
                  ${textoBusqueda.trim() !== ""
              ? `No hay carreras que coincidan con "${textoBusqueda}" y los filtros seleccionados.`
              : "No hay carreras que coincidan con los filtros seleccionados."
            }
                </p>
                <div class="space-y-2">
                  <p class="text-sm text-gray-500">Intentá:</p>
                  <ul class="text-sm text-gray-500 space-y-1">
                    ${textoBusqueda.trim() !== "" ? '<li>• Revisar la ortografía de tu búsqueda</li>' : ''}
                    <li>• Usar términos más generales</li>
                    <li>• Quitar algunos filtros</li>
                    <li>• Explorar otras áreas de estudio</li>
                  </ul>
                </div>
                <button 
                  onclick="limpiarFiltrosYBusqueda()" 
                  class="mt-4 bg-[#D6001C] text-white px-4 py-2 rounded-lg hover:bg-[#B8001A] transition-colors text-sm font-medium"
                >
                  Limpiar filtros y búsqueda
                </button>
              </div>
            </div>
          `;
        } else {
          containerCarreras.innerHTML = carrerasFiltradas.map(career => {
            career.popular = career.estudiantes >= 1000 ? true : false;
            return `
            <div class="border border-gray-500 shadow-md p-3 sm:p-4 space-y-3 sm:space-y-2 h-max">
              <div class="grid grid-cols-2 space-y-2 sm:space-y-0">
                <div class="flex justify-start">
                  <img src="${career.imagen}" alt="${career.nombre}" class="object-contain w-12 h-12 sm:w-16 sm:h-16">
                </div>
                <div class="flex justify-end items-center space-x-2">
                  ${career.popular ? '<img src="./public/areas/populares.svg" alt="Carrera destacada" class="w-5 h-5 sm:w-6 sm:h-6">' : ''}
                  ${career.destacada ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>' : ''}
                </div>
              </div>
              <h3 class="font-bold text-left text-base sm:text-lg">${career.nombre}</h3>
              <div class="flex flex-col space-y-2 sm:grid sm:grid-rows-2 sm:gap-2 sm:space-y-0">
                <div class="flex items-center justify-start">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  <span class="text-xs sm:text-sm font-semibold px-1">${career.duracion}</span>
                </div>
                <div class="flex items-center justify-start">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                  <span class="text-xs sm:text-sm font-semibold px-1">${obtenerNombreModalidad(career.modalidad)}</span>
                </div>
              </div>
              <p class="text-gray-600 text-xs sm:text-sm text-left leading-relaxed">${career.descripcion}</p>
              <div class="flex flex-col space-y-3 sm:grid sm:grid-rows-2 sm:space-y-0">
                <div class="flex justify-center sm:justify-start">
                  <span class="text-xs font-medium text-gray-700 bg-gray-200 h-fit py-1 px-2 rounded-sm">${career.categoria}</span>
                </div>
                <a href="#formu" class="boton-cta text-center max-md:text-sm justify-center inline-flex items-center w-full sm:w-auto mt-2 sm:mt-0">
                  Más info
                </a>
              </div>
            </div>
          `}).join('');
        }
      }

      // Función global para limpiar filtros
      window.limpiarFiltrosYBusqueda = function () {
        textoBusqueda = "";
        if (searchInput) {
          searchInput.value = "";
        }
        filtrosActivos = [];
        filtrosAreaActivos = [];
        updateAllFilterStates();
        updateActiveFiltersCount();
        renderCarreras();
      }

      // Event listener para búsqueda
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          textoBusqueda = e.target.value;
          renderCarreras();
        });
      }

      // Inicializar filtros y carreras
      filtrosRender();
      renderCarreras();

      /* --------------------- Modalidades ----------------------------- */
      function renderModalidades() {
        const container = document.getElementById("modalidades");
        if (!container || !modalidades) return;

        container.innerHTML = modalidades.map(modalidad => `
          <div class="bg-white/80 backdrop-blur-lg rounded-lg border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col max-md:h-fit md:w-[50%]">
            <div class="p-4 md:p-5 flex-1 flex flex-col">
              <div class="flex flex-col md:flex-row md:items-start gap-3">
                <div class="flex justify-center md:justify-start">
                  <img src="${modalidad.imagen}" alt="${modalidad.nombre}"
                    class="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg">
                </div>
                <div class="flex-1 text-left">
                  <h3 class="md:text-2xl font-bold text-gray-800 mb-2">
                    ${modalidad.nombre}
                  </h3>
                  <p class="text-xs md:text-base text-gray-600 leading-relaxed">
                    ${modalidad.descripcion}
                  </p>
                </div>
              </div>
              <div class="mt-2 md:mt-4 flex-1 flex flex-col md:justify-end">
                <div class="flex items-center justify-between md:justify-start mobile-expand-trigger md:cursor-default"
                  onclick="toggleCharacteristics(${modalidad.id})">
                  <h3 class="font-semibold text-gray-700">
                    Características
                  </h3>
                  <button class="xl:hidden text-[#D6001C] p-1 transform transition rotate-180" id="expand-btn-${modalidad.id}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
                <div class="transition-all transform md:expanded ease-in-out duration-300 collapsed mt-3" id="characteristics-${modalidad.id}">
                  <ul class="space-y-1 pl-4 md:pl-6">
                    ${modalidad.caracteristicas.map(caracteristica => `
                    <li class="list-disc">
                      <span class="text-xs md:text-base text-gray-600">
                        ${caracteristica}
                      </span>
                    </li>
                    `).join('')}
                  </ul>
                  <div class="pt-3 md:pt-4">
                    <button class="boton-cta flex justify-center items-center" data-filter="${modalidad.id}" id="boton-modalidad">
                      <svg class="md:w-5 md:h-5 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      <span class="text-xs md:text-base">
                        Buscar carreras ${modalidad.nombre.toLowerCase()}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`).join('');

        // Event listeners para botones de modalidades
        const botonesModalidad = container.querySelectorAll("#boton-modalidad");
        botonesModalidad.forEach(button => {
          button.addEventListener('click', function (e) {
            const modalidadFilter = e.currentTarget.dataset.filter;
            filtrosActivos = [];
            filtrosActivos.push(modalidadFilter);

            const botonesFiltros = containerFiltros.querySelectorAll("#boton-filtro");
            botonesFiltros.forEach(btn => {
              btn.classList.remove("bg-[#D6001C]", "text-white");
              btn.classList.add("bg-white");
            });

            const botonesFiltrosArea = containerFiltrosArea.querySelectorAll("#boton-filtro");
            botonesFiltrosArea.forEach(btn => {
              btn.classList.remove("bg-[#D6001C]", "text-white");
              btn.classList.add("bg-white");
            });

            filtrosActivos.forEach(filtroId => {
              const activeBtn = containerFiltros.querySelector(`[data-filter="${filtroId}"]`);
              const activeBtnArea = containerFiltrosArea.querySelector(`[data-filter="${filtroId}"]`);

              if (activeBtn) {
                activeBtn.classList.remove("bg-white");
                activeBtn.classList.add("bg-[#D6001C]", "text-white");
              }

              if (activeBtnArea) {
                activeBtnArea.classList.remove("bg-white");
                activeBtnArea.classList.add("bg-[#D6001C]", "text-white");
              }
            });

            renderCarreras();
            window.location.href = '#carreras';
          });
        });
      }

      // Función para toggle de características en mobile
      window.toggleCharacteristics = function (modalidadId) {
        if (!isMobile) return;

        const content = document.getElementById(`characteristics-${modalidadId}`);
        const button = document.getElementById(`expand-btn-${modalidadId}`);

        if (!content || !button) return;

        const isCollapsed = content.classList.contains('collapsed');

        if (isCollapsed) {
          content.classList.remove('collapsed');
          content.classList.add('max-h-[500px]', 'opacity-100');
          button.classList.add('rotate-none');
        } else {
          content.classList.remove('max-h-[500px]', 'opacity-100');
          content.classList.add('collapsed');
          button.classList.remove('rotate-none');
        }
      }
      // Función para manejar el resize de ventana
      function handleModalidadesResize() {
        if (!modalidades) return;

        modalidades.forEach(modalidad => {
          const content = document.getElementById(`characteristics-${modalidad.id}`);
          const button = document.getElementById(`expand-btn-${modalidad.id}`);

          if (!content || !button) return;

          if (!isMobile) {
            content.classList.remove('collapsed');
            content.classList.add('max-h-[500px]', 'opacity-100');
          } else {
            if (!content.classList.contains('max-h-[500px]', 'opacity-100')) {
              content.classList.add('collapsed');
              content.classList.remove('max-h-[500px]', 'opacity-100');
            }
          }
        });
      }
      window.addEventListener('resize', handleModalidadesResize);
      /* --------------------- Carreras Más Elegidas ----------------------------- */
      function renderCarrerasElegidas() {
        const container = document.getElementById("carrerasElegidas");
        if (container) {
          carrerasElegidas.forEach((career) => {
            career.modalidad.includes(7) ? career.nombre = career.nombre + " " + "(Online)" : career.nombre
            const card = document.createElement("div");
            card.className = "bg-black/5 rounded-lg p-3";

            card.innerHTML = `
        <div class="flex items-center space-x-3">
          <div>
            <div class="text-black font-medium text-sm">${career.nombre}</div>
            <div class="text-black text-xs">+${career.estudiantes} estudiantes</div>
          </div>
        </div>
      `;
            container.appendChild(card);
          });
        }
      }
      // Renderizar modalidades
      renderModalidades();
      handleModalidadesResize();
      renderCarrerasElegidas()
    })
    .catch(error => {
      console.error('Error al cargar datos de carreras:', error);
    });
}

/* --------------------- Carruseles ----------------------------- */
class GenericCarousel {
  constructor({ items, selectors, autoPlayDelay = 3000 }) {
    this.items = items;
    this.selectors = selectors;
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    this.isTransitioning = false;
    this.autoPlayDelay = autoPlayDelay;

    this.init();
  }

  init() {
    this.cacheElements();
    this.createDots();
    this.bindEvents();
    this.renderItem();
    this.startAutoPlay();
  }

  cacheElements() {
    this.elements = {
      container: document.querySelector(this.selectors.container),
      imagen: document.querySelector(this.selectors.imagen),
      text: document.querySelector(this.selectors.text),
      titulo: document.querySelector(this.selectors.titulo),
      subtitulo: document.querySelector(this.selectors.subtitulo),
      dots: document.querySelector(this.selectors.dots),
      prevBtn: document.querySelector(this.selectors.prevBtn),
      nextBtn: document.querySelector(this.selectors.nextBtn),
    };
  }

  createDots() {
    if (!this.elements.dots) return;
    this.elements.dots.innerHTML = '';
    this.items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${index === this.currentIndex ? 'bg-[#D6001C]' : 'bg-gray-800'}`;
      dot.setAttribute('aria-label', `Ir al elemento ${index + 1}`);
      dot.addEventListener('click', () => this.goToItem(index));
      this.elements.dots.appendChild(dot);
    });
  }

  bindEvents() {
    this.elements.prevBtn?.addEventListener('click', () => this.previousItem());
    this.elements.nextBtn?.addEventListener('click', () => this.nextItem());

    this.elements.container?.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.elements.container?.addEventListener('mouseleave', () => this.startAutoPlay());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousItem();
      if (e.key === 'ArrowRight') this.nextItem();
    });
  }

  async renderItem() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    const item = this.items[this.currentIndex];

    try {
      this.elements.container.style.opacity = '0';
      await this.wait(100);

      // Manejo mejorado de imágenes y SVG
      if (this.elements.imagen && (item.imagen || item.icono)) {
        if (item.icono) {
          // Si es código SVG (icono), reemplazar el contenido del contenedor de imagen
          if (this.elements.imagen.tagName === 'IMG') {
            // Si el elemento es una img, crear un div contenedor
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = item.icono;
            svgContainer.className = this.elements.imagen.className;
            this.elements.imagen.parentNode.replaceChild(svgContainer, this.elements.imagen);
            this.elements.imagen = svgContainer;
          } else {
            // Si ya es un contenedor, simplemente actualizar el contenido
            this.elements.imagen.innerHTML = item.icono;
          }

          // Aplicar descripcion como título si existe
          if (item.descripcion) {
            const svgElement = this.elements.imagen.querySelector('svg');
            if (svgElement) {
              svgElement.setAttribute('title', item.descripcion);
              svgElement.setAttribute('aria-label', item.nombre || item.descripcion);
            }
          }
        } else if (item.imagen) {
          // Si es una imagen normal
          if (this.elements.imagen.tagName !== 'IMG') {
            // Si el elemento actual es un contenedor SVG, crear un img
            const imgElement = document.createElement('img');
            imgElement.className = this.elements.imagen.className;
            imgElement.src = item.imagen;
            imgElement.alt = item.descripcion || item.nombre || '';
            this.elements.imagen.parentNode.replaceChild(imgElement, this.elements.imagen);
            this.elements.imagen = imgElement;
          } else {
            // Si ya es una img, simplemente actualizar src y alt
            this.elements.imagen.src = item.imagen;
            this.elements.imagen.alt = item.descripcion || item.nombre || '';
          }
        }
      }

      if (this.elements.text) this.elements.text.textContent = item.descripcion || item.text || '';
      if (this.elements.titulo) this.elements.titulo.textContent = item.nombre || item.titulo || '';
      if (this.elements.subtitulo) this.elements.subtitulo.textContent = item.subtitulo || '';

      this.updateDots();

      this.elements.container.style.opacity = '1';
      await this.wait(100);

    } catch (error) {
      console.error('Error rendering item:', error);
      this.elements.container.style.opacity = '1';
    } finally {
      this.isTransitioning = false;
    }
  }

  updateDots() {
    if (!this.elements.dots) return;
    const dots = this.elements.dots.children;
    Array.from(dots).forEach((dot, index) => {
      dot.className = `w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${index === this.currentIndex ? 'bg-[#D6001C]' : 'bg-gray-500'}`;
    });
  }

  goToItem(index) {
    if (index === this.currentIndex || this.isTransitioning) return;
    this.currentIndex = index;
    this.renderItem();
    this.restartAutoPlay();
  }

  nextItem() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.renderItem();
    this.restartAutoPlay();
  }

  previousItem() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.renderItem();
    this.restartAutoPlay();
  }

  startAutoPlay() {
    // Si autoPlayDelay es 0, null, undefined o false, no iniciar autoplay
    if (!this.autoPlayDelay || this.autoPlayDelay <= 0) {
      return;
    }

    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.nextItem(), this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  restartAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

function initCarousels() {
  const testimonios = [
    {
      nombre: "Benjamin Elizalde",
      subtitulo: "Licenciatura en comercialización",
      descripcion: '"La facultad esta siempre a disposición"',
      imagen: "./public/testimonios/benja.webp",
    },
    {
      nombre: "Ebaneo Valdez Kao",
      subtitulo: "Ingeniería en Informática",
      descripcion: '"Puedo ejercer mi profesión desde cualquier parte del del mundo"',
      imagen: "./public/testimonios/kao.webp",
    },
    {
      nombre: "Luciana Gennari",
      subtitulo: "Kinesiologia",
      descripcion: '"Para poder rendir bien academicamente y en entrenamiento la universidad me da una ayuda gigante"',
      imagen: "./public/testimonios/luciana.webp",
    }
  ];

  new GenericCarousel({
    items: testimonios,
    selectors: {
      container: "#contenido-testimonial",
      imagen: "#imagen-testimonial",
      text: "#texto-testimonial",
      titulo: "#nombre-testimonial",
      subtitulo: "#carrera-testimonial",
      dots: "#puntos-testimonios",
      prevBtn: "#prev-testimonial",
      nextBtn: "#next-testimonial"
    },
    autoPlayDelay: 5000
  });
}

/* --------------------- Componente Potencia ----------------------------- */
function initPotencia() {
  const potencia = [
    { id: "descanso", nombre: "Zonas de descanso", descripcion: "Espacios cómodos y tranquilos para relajarte y recargar energías entre clases.", icono: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" > <rect x="8" y="24" width="32" height="12" rx="4" fill="#fff" stroke="#000" stroke-width="2"/> <rect x="12" y="14" width="24" height="12" rx="6" fill="#fff" stroke="#000" stroke-width="2"/> <rect x="10" y="36" width="4" height="6" rx="2" fill="#fff" stroke="#000" stroke-width="2"/> <rect x="34" y="36" width="4" height="6" rx="2" fill="#fff" stroke="#000" stroke-width="2"/> </svg>`, imagen: "./public/potencia/descanso.webp" },
    { id: "deporte", nombre: "Espacios deportivos", descripcion: "Instalaciones deportivas de primer nivel para mantenerte activo y saludable.", icono: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke-width="3" stroke="#000000" fill="none" width="36" height="36"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><circle cx="33.69" cy="32" r="24.99" stroke-linecap="round"></circle><polygon points="33.43 20.18 22.84 27.88 26.89 40.32 39.98 40.32 44.02 27.88 33.43 20.18" stroke-linecap="round"></polygon><polyline points="40.41 7.92 33.43 13.48 26.59 8.04" stroke-linecap="round"></polyline><line x1="33.43" y1="20.18" x2="33.43" y2="13.48" stroke-linecap="round"></line><polyline points="58.68 32 50.6 25.92 53.78 17.14" stroke-linecap="round"></polyline><polyline points="40.72 55.99 44.02 46.39 54.05 46.49" stroke-linecap="round"></polyline><polyline points="25.61 55.65 22.55 46.39 13.26 46.39" stroke-linecap="round"></polyline><polyline points="8.7 32 15.99 25.97 13.16 17.76" stroke-linecap="round"></polyline><line x1="22.84" y1="27.88" x2="15.99" y2="25.97" stroke-linecap="round"></line><line x1="26.89" y1="40.32" x2="22.55" y2="46.39" stroke-linecap="round"></line><line x1="39.98" y1="40.32" x2="44.02" y2="46.39" stroke-linecap="round"></line><line x1="44.02" y1="27.89" x2="50.6" y2="25.92" stroke-linecap="round"></line></g></svg>`, imagen: "./public/potencia/deportes.webp" },
    { id: "biblioteca", nombre: "Biblioteca y coworking", descripcion: "Acceso a una vasta colección de recursos académicos y espacios de estudio.", icono: `<svg width="36" height="36" viewBox="0 0 48.00 48.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.344"></g><g id="SVGRepo_iconCarrier"> <path d="M37 16C34.2386 16 32 13.7614 32 11C32 8.23858 34.2386 6 37 6C39.7614 6 42 8.23858 42 11C42 13.7614 39.7614 16 37 16Z" fill="#ffffff" stroke="#000000" stroke-width="1.344" stroke-miterlimit="2"></path> <path d="M12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8C16 10.2091 14.2091 12 12 12Z" fill="#ffffff" stroke="#000000" stroke-width="1.344" stroke-miterlimit="2"></path> <path d="M26 39L32 34V28C32 24.5339 34 22 37 22C40 22 42 24.5339 42 28V32.8372V42" stroke="#000000" stroke-width="1.344" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M24 33L18 28V24C18 20.5339 16 18 13 18C10 18 8 20.5339 8 24V26.8372V42" stroke="#000000" stroke-width="1.344" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`, imagen: "./public/potencia/biblioteca.webp" },
    { id: "laboratorio", nombre: "Laboratorios", descripcion: "Laboratorios equipados con tecnología de vanguardia para prácticas y experimentación.", icono: `<svg fill="#000000" width="36" height="36" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 72 72" enable-background="new 0 0 72 72" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M67.625,56.738C67.592,56.688,67.66,56.787,67.625,56.738L47.823,28.167V5.42c0-1.105-0.539-1.92-1.643-1.92H27.179 c-1.104,0-1.356,0.816-1.356,1.92v22.097L4.904,56.764c-0.035,0.049-0.217,0.277-0.248,0.33c-1.688,2.926-2.078,5.621-0.785,7.86 c1.306,2.261,3.915,3.546,7.347,3.546h49.451c3.429,0,6.118-1.287,7.424-3.551C69.389,62.704,69.313,59.666,67.625,56.738z M29.137,29.302c0.237-0.338,0.687-0.74,0.687-1.152V7.5h14v21.301c0,0.412-0.194,0.824,0.044,1.161l9.19,13.262 c-3.056,1.232-6.822,2.05-14.531-2.557c-5.585-3.337-12.499-2.048-17.199-0.449L29.137,29.302z M64.55,62.949 c-0.554,0.96-1.969,1.551-3.88,1.551H11.219c-1.915,0-3.33-0.589-3.883-1.547c-0.532-0.922-0.324-2.391,0.571-3.975l11.287-15.777 c3.942-1.702,12.219-4.454,18.308-0.816c4.852,2.898,8.367,3.814,11.116,3.814c2.291,0,4.05-0.637,5.607-1.291l9.755,14.076 C64.877,60.568,65.085,62.023,64.55,62.949z"></path> <path d="M22.026,50.969c-3.017,0-5.471,2.453-5.471,5.471c0,3.017,2.454,5.471,5.471,5.471c3.016,0,5.471-2.454,5.471-5.471 C27.497,53.422,25.043,50.969,22.026,50.969z M22.026,59.911c-1.914,0-3.471-1.558-3.471-3.472s1.557-3.471,3.471-3.471 s3.471,1.557,3.471,3.471S23.94,59.911,22.026,59.911z"></path> <path d="M50.775,52.469c-2.603,0-4.721,2.117-4.721,4.721c0,2.603,2.118,4.721,4.721,4.721c2.604,0,4.722-2.118,4.722-4.721 C55.497,54.586,53.379,52.469,50.775,52.469z M50.775,59.911c-1.5,0-2.721-1.222-2.721-2.722s1.221-2.721,2.721-2.721 s2.722,1.221,2.722,2.721S52.275,59.911,50.775,59.911z"></path> <path d="M35.077,45.469c-2.217,0-4.021,1.803-4.021,4.021c0,2.217,1.803,4.021,4.021,4.021c2.217,0,4.021-1.805,4.021-4.021 S37.294,45.469,35.077,45.469z M35.077,51.512c-1.114,0-2.021-0.908-2.021-2.021c0-1.114,0.907-2.021,2.021-2.021 c1.114,0,2.021,0.906,2.021,2.021S36.191,51.512,35.077,51.512z"></path> <path d="M40.824,22.42c0.553,0,1-0.447,1-1v-11c0-0.553-0.447-1-1-1s-1,0.447-1,1v11C39.824,21.973,40.271,22.42,40.824,22.42z"></path> <path d="M40.824,27.42c0.553,0,1-0.447,1-1v-1c0-0.553-0.447-1-1-1s-1,0.447-1,1v1C39.824,26.973,40.271,27.42,40.824,27.42z"></path> </g> </g></svg>`, imagen: "./public/potencia/" },
    { id: "hospital", nombre: "Hospital Escuela", descripcion: "Servicios de atención médica y bienestar para cuidar tu salud integral.", icono: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="10" width="8" height="28" fill="#fff" stroke="#000" stroke-width="2"/><rect x="10" y="20" width="28" height="8" fill="#fff" stroke="#000" stroke-width="2"/></svg>`, imagen: "./public/potencia/Hospital-Escuela.webp" },
    { id: "talleres", nombre: "Talleres y Actividades", descripcion: "Talleres, cursos y actividades extracurriculares para potenciar tus habilidades y creatividad.", icono: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="36" height="36"> <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>`, imagen: "./public/potencia/talleres.webp" },
    { id: "espacios", nombre: "Espacios Verdes", descripcion: "Áreas verdes para disfrutar al aire libre, descansar y conectar con la naturaleza.", icono: `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="36" height="36" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Guides"> <g id="_x32_0_px_2_"> </g> <g id="_x32_0px"> </g> <g id="_x34_0px"> </g> <g id="_x34_4_px"> </g> <g id="_x34_8px"> <g id="_x31_6px"> </g> <g id="square_4px"> <g id="_x32_8_px"> <g id="square_4px_2_"> </g> <g id="square_4px_3_"> </g> <g id="square_4px_1_"> </g> <g id="_x32_4_px_2_"> </g> <g id="_x31_2_px"> </g> </g> </g> </g> <g id="Icons"> </g> <g id="_x32_0_px"> </g> <g id="square_6px"> <g id="_x31_2_PX"> </g> </g> <g id="_x33_6_px"> <g id="_x33_2_px"> <g id="_x32_8_px_1_"> <g id="square_6px_1_"> </g> <g id="_x32_0_px_1_"> <g id="_x31_2_PX_2_"> </g> <g id="_x34_8_px"> <g id="_x32_4_px"> </g> <g id="_x32_4_px_1_"> </g> </g> </g> </g> </g> </g> <g id="_x32_0_px_3_"> </g> <g id="_x32_0_px_4_"> </g> <g id="New_Symbol_8"> <g id="_x32_4_px_3_"> </g> </g> </g> <g id="Artboard"> </g> <g id="Free_Icons"> <g> <polygon style="fill:none;stroke:#000000;stroke-linejoin:round;stroke-miterlimit:10;" points="17.5,18 11.5,22 5.5,18 5.5,12 11.5,0.5 17.5,12 "></polygon> <line style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" x1="11.5" y1="8.5" x2="11.5" y2="23.5"></line> <polyline style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="15,14.5 11.5,17.5 8,14.5 "></polyline> <polyline style="fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="14,11.5 11.5,13.5 9,11.5 "></polyline> </g> </g> </g></svg>`, imagen: "./public/potencia/espacios-verdes.webp" },
    { id: "estudio", nombre: "Estudio de radio y TV", descripcion: "Instalaciones profesionales para la producción y transmisión de contenidos audiovisuales y radiales.", icono: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="36" height="36"> <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 7.5 16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0 0 12 6.75Zm-1.683 6.443-.005.005-.006-.005.006-.005.005.005Zm-.005 2.127-.005-.006.005-.005.005.005-.005.005Zm-2.116-.006-.005.006-.006-.006.005-.005.006.005Zm-.005-2.116-.006-.005.006-.005.005.005-.005.005ZM9.255 10.5v.008h-.008V10.5h.008Zm3.249 1.88-.007.004-.003-.007.006-.003.004.006Zm-1.38 5.126-.003-.006.006-.004.004.007-.006.003Zm.007-6.501-.003.006-.007-.003.004-.007.006.004Zm1.37 5.129-.007-.004.004-.006.006.003-.004.007Zm.504-1.877h-.008v-.007h.008v.007ZM9.255 18v.008h-.008V18h.008Zm-3.246-1.87-.007.004L6 16.127l.006-.003.004.006Zm1.366-5.119-.004-.006.006-.004.004.007-.006.003ZM7.38 17.5l-.003.006-.007-.003.004-.007.006.004Zm-1.376-5.116L6 12.38l.003-.007.007.004-.004.007Zm-.5 1.873h-.008v-.007h.008v.007ZM17.25 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm0 4.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>`, imagen: "./public/potencia/radio-tv.webp" },
    { id: "accesibilidad", nombre: "Accesibilidad", descripcion: "Infraestructura y servicios adaptados para garantizar la inclusión y el acceso de todas las personas.", icono: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36"><g id="SVGRepo_bgCarrier" stroke-width="0" ></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" stroke="#000000" stroke-width="1.5"></path> <path d="M18 10C18 10 14.4627 11.5 12 11.5C9.53727 11.5 6 10 6 10" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path> <path d="M12 12V13.4522M12 13.4522C12 14.0275 12.1654 14.5906 12.4765 15.0745L15 19M12 13.4522C12 14.0275 11.8346 14.5906 11.5235 15.0745L9 19" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path> <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="#000000" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>`, imagen: "./public/potencia/accesibilidad.webp" },
    { id: "gastronomia", nombre: "Zonas Gastronómicas", descripcion: "Espacios dedicados a la alimentación, con variedad de opciones para disfrutar comidas y bebidas.", icono: `<svg fill="#000000" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="36" height="36"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g data-name="Calque 2" id="Calque_2"> <path d="M85.08,47.56H74.25a1.5,1.5,0,0,0-1.5,1.5v4.46H67.07l-5.83-12h8.92a1.5,1.5,0,0,0,1.5-1.5v-6a1.5,1.5,0,0,0-1.5-1.5H30.54a1.5,1.5,0,0,0-1.5,1.5v6a1.5,1.5,0,0,0,1.5,1.5h7.7l-5.2,12H28V49.06a1.5,1.5,0,0,0-1.5-1.5H15.62a1.5,1.5,0,0,0-1.5,1.5v6a1.5,1.5,0,0,0,1.5,1.5H31.74l-4.32,9.92a1.51,1.51,0,0,0,.78,2,1.61,1.61,0,0,0,.6.12,1.49,1.49,0,0,0,1.37-.9L35,56.52H65.2l5.35,11a1.5,1.5,0,0,0,1.35.84,1.55,1.55,0,0,0,.66-.15,1.51,1.51,0,0,0,.69-2l-4.71-9.64H85.08a1.5,1.5,0,0,0,1.5-1.5v-6A1.5,1.5,0,0,0,85.08,47.56Zm-1.5,6H75.75v-3h7.83ZM32,35.61H68.66v3H32Zm9.44,6s0,0,0-.08H58a1.27,1.27,0,0,0,.12.36l5.66,11.6H36.31ZM17.12,53.52v-3H25v3H17.12Z"></path> </g> </g></svg>`, imagen: "./public/potencia/zonas-gastronomicas.webp" }
  ]

  const containerPotencia = document.getElementById("potencia")

  if (containerPotencia) {
    if (isMobile) {
      // Crear estructura para carrusel en mobile
      containerPotencia.innerHTML = `
        <div class="xl:hidden w-full col-span-2">
          <!-- Contenedor del carrusel -->
          <div id="potencia-carousel-container" class="relative bg-white/80 rounded-xl p-4 shadow-xl transition-opacity duration-300">
            <div class="flex items-center gap-4">
              <div id="potencia-carousel-image" class="w-12 h-12 rounded-xl">
                ${potencia[0].icono} 
              </div>
              <div class="flex-1">
                <h3 id="potencia-carousel-title" class="font-semibold">${potencia[0].nombre}</h3>
                <p id="potencia-carousel-description" class="text-xs text-gray-600">${potencia[0].descripcion}</p>
              </div>
            </div>
            <!-- Controles del carrusel -->
            <div class="flex justify-between items-center mt-4">
              <button id="potencia-prev" class="bg-gray-400/50 rounded-full p-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18l-6-6 6-6"></path>
                </svg>
              </button>
              <div id="potencia-dots" class="flex space-x-2">
                <!-- Dots generados dinámicamente -->
              </div>
              <button id="potencia-next" class="bg-gray-400/50 rounded-full p-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18l6-6-6-6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      // Inicializar carrusel para mobile
      const potenciaCarouselData = potencia.map(item => ({
        titulo: item.nombre,
        text: item.descripcion,
        icono: item.icono,
        imagen: item.imagen
      }));

      const potenciaCarousel = new GenericCarousel({
        items: potenciaCarouselData,
        selectors: {
          container: "#potencia-carousel-container",
          imagen: "#potencia-carousel-image",
          text: "#potencia-carousel-description",
          titulo: "#potencia-carousel-title",
          dots: "#potencia-dots",
          prevBtn: "#potencia-prev",
          nextBtn: "#potencia-next"
        },
        autoPlayDelay: 0
      });

      const mainImage = document.querySelector('img[alt="Placeholder Image"]');
      if (mainImage) {
        // Cambiar imagen inicial
        mainImage.src = potencia[0].imagen;
        mainImage.alt = potencia[0].nombre;

        // Override del método renderItem para incluir cambio de imagen principal
        const originalRenderItem = potenciaCarousel.renderItem.bind(potenciaCarousel);
        potenciaCarousel.renderItem = async function () {
          await originalRenderItem();
          const currentItem = potencia[this.currentIndex];
          if (mainImage && currentItem.imagen) {
            mainImage.src = currentItem.imagen;
            mainImage.alt = currentItem.nombre;
          }
        };
      }

    } else {
      containerPotencia.innerHTML = potencia.map(item => `
        <div class="bg-white/80 rounded-xl md:flex md:flex-row justify-center items-center gap-4 p-4 shadow-xl cursor-pointer hover:bg-gray-100 transition-colors hidden md:block" data-potencia-id="${item.id}" data-imagen="${item.imagen}">
          <div class="w-12 h-12 flex items-center justify-center rounded-xl">
            ${item.icono}
          </div>
          <div class="grid-rows-2 space-y-2 inline-block">
            <h3 class="font-bold">${item.nombre}</h3>
            <p class="text-sm">${item.descripcion}</p>
          </div>
          <div class="-rotate-90">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      `).join('');

      const potenciaItems = containerPotencia.querySelectorAll('[data-potencia-id]');
      const mainImage = document.querySelector('img[alt="Placeholder Image"]');

      potenciaItems.forEach(item => {
        item.addEventListener('click', function () {
          const imagenSrc = this.getAttribute('data-imagen');
          if (mainImage && imagenSrc) {
            mainImage.src = imagenSrc;
            mainImage.alt = this.querySelector('h3').textContent;
          }

          // Quitamos el fondo blanco de todos los ítems
          potenciaItems.forEach(i => i.classList.remove('border-[#D6001C]', 'border', 'bg-gray-100'));

          // Agregamos el fondo blanco solo al ítem seleccionado
          this.classList.add('border-[#D6001C]', 'border', 'bg-gray-100');
        });
      });
    }

  }
}
/* --------------------- Formulario ----------------------------- */
function initFormulario() {
  // Script para el formulario
  (async () => {
    try {
      const resp = await fetch(
        `../../landing/consultas/getCarrerasJson.php?tipcar=Grado,Pregrado,Intermedio`
      );
      const data = await resp.json();

      let codigosExcluidos = ["191", "46"];
      let dataFiltrado = data.filter((carrera) => !codigosExcluidos.includes(carrera.codcar));

      window.localStorage.setItem("CarrerasModGeneral", JSON.stringify(dataFiltrado));

      $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');
      $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
      $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');

      setTimeout(() => {
        const provinciaElement = document.getElementById('cbx_provincia');
        const sedeElement = document.getElementById('cbx_sede');
        const carreraElement = document.getElementById('cbx_carrera');

        if (provinciaElement) {
          provinciaElement.setAttribute("disabled", "disabled");
          provinciaElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
        }

        if (sedeElement) {
          sedeElement.setAttribute("disabled", "disabled");
          sedeElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
        }

        if (carreraElement) {
          carreraElement.setAttribute("disabled", "disabled");
          carreraElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
        }

        const provinciaWrapper = provinciaElement?.closest('.select-wrapper');
        const sedeWrapper = sedeElement?.closest('.select-wrapper');

        if (provinciaWrapper) {
          provinciaWrapper.classList.remove('enabled');
          provinciaWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
        }
        if (sedeWrapper) {
          sedeWrapper.classList.remove('enabled');
          sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
        }
      }, 100);

    } catch (error) {
      console.error("❌ Error al cargar carreras:", error);
      mostrarErrorEnLaUI("No se pudieron cargar las carreras en este momento.");
    }
  })();

  // Inicialización del formulario
  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  if (!form) return;

  const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  const btn = document.getElementById('formButton');

  if (btn) {
    btn.classList.add("boton-inactivo");
    btn.setAttribute("disabled", "disabled");
  }

  function checkFormCompletion() {
    if (!window.recaptchaCompleted || !btn) return;

    let allFieldsCompleted = true;

    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        allFieldsCompleted = false;
      }
    });

    if (allFieldsCompleted) {
      btn.removeAttribute("disabled");
      btn.classList.add("boton-activo");
      btn.classList.remove("boton-inactivo");
    } else {
      btn.setAttribute("disabled", "disabled");
      btn.classList.remove("boton-activo");
      btn.classList.add("boton-inactivo");
    }
  }

  requiredInputs.forEach(input => {
    input.addEventListener('input', checkFormCompletion);
    input.addEventListener('change', checkFormCompletion);
    input.addEventListener('blur', checkFormCompletion);
  });
}

/* --------------------- Funciones globales del formulario ----------------------------- */
function mostrarErrorEnLaUI(mensaje) {
  $("#cbx_carrera").empty().append(`<option value="" disabled selected>${mensaje}</option>`);
  $("#cbx_provincia").empty().append(`<option value="" disabled selected>-</option>`);
  $("#cbx_sede").empty().append(`<option value="" disabled selected>-</option>`);

  document.getElementById('cbx_provincia')?.setAttribute("disabled", "disabled");
  document.getElementById('cbx_sede')?.setAttribute("disabled", "disabled");
  document.getElementById('cbx_carrera')?.setAttribute("disabled", "disabled");
}

$(window).on("load", function () {
  if (window.location.href.split("?")[1]) {
    $('a[href*="https://sistemas"]').each(function () {
      var con = $(this).prop("href").split("?").length == 1 ? "?" : "&";
      $(this).prop(
        "href",
        $(this).prop("href") + con + window.location.href.split("?")[1]
      );
    });
  }
});

function cambiar_modo() {
  var modo = $("#modo").val();

  if (!modo) {
    resetearFormulario();
    return;
  }

  $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
  $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  let provinciaElement = document.getElementById('cbx_provincia');
  if (provinciaElement) {
    provinciaElement.removeAttribute("disabled");
    provinciaElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600";

    const provinciaWrapper = provinciaElement.closest('.select-wrapper');
    if (provinciaWrapper) {
      provinciaWrapper.classList.add('enabled');
      provinciaWrapper.setAttribute('data-tooltip', '');
    }
  }

  let sedeElement = document.getElementById('cbx_sede');
  if (sedeElement) {
    sedeElement.setAttribute("disabled", "disabled");
    sedeElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";

    const sedeWrapper = sedeElement.closest('.select-wrapper');
    if (sedeWrapper) {
      sedeWrapper.classList.remove('enabled');
      sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una provincia primero');
    }
  }

  let carreraElement = document.getElementById('cbx_carrera');
  if (carreraElement) {
    carreraElement.setAttribute("disabled", "disabled");
    carreraElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }

  var carrerasArray = JSON.parse(window.localStorage.getItem("CarrerasModGeneral") || "[]");
  const carrerasMod = carrerasArray.filter(carreras => carreras.modo == modo);

  if (carrerasMod.length > 0) {
    var listaProvincia = [];
    var list_prov_id = [];

    carrerasMod.forEach(function (valorCarrera) {
      if (valorCarrera.provincias) {
        valorCarrera.provincias.forEach(function (provincia) {
          if (!list_prov_id.includes(provincia.id_provincia)) {
            list_prov_id.push(provincia.id_provincia);
            listaProvincia.push(provincia);
          }
        });
      }
    });

    listaProvincia.sort((a, b) => a.nombre_provincia.localeCompare(b.nombre_provincia));

    listaProvincia.forEach(function (provincia) {
      $("#cbx_provincia").append(
        `<option value="${provincia.id_provincia}">${provincia.nombre_provincia}</option>`
      );
    });

    if (listaProvincia.length === 1) {
      $("#cbx_provincia").val($("#cbx_provincia option:eq(1)").val());
      cargar_sedes();
    }
  }
}

function cargar_sedes() {
  const modo = document.getElementById('modo').value;
  const provincia = document.getElementById('cbx_provincia').value;
  const sedeSelect = document.getElementById('cbx_sede');
  const carreraSelect = document.getElementById('cbx_carrera');

  if (!sedeSelect || !carreraSelect) return;

  const sedeWrapper = sedeSelect.closest('.select-wrapper');

  $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  carreraSelect.setAttribute("disabled", "disabled");
  carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";

  if (provincia && modo) {
    sedeSelect.removeAttribute("disabled");
    sedeSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600";

    if (sedeWrapper) {
      sedeWrapper.classList.add('enabled');
      sedeWrapper.setAttribute('data-tooltip', '');
    }

    let carrerasArray = JSON.parse(localStorage.getItem("CarrerasModGeneral") || "[]");
    const carrerasMod = carrerasArray.filter(c => c.modo == modo);

    var listaSedes = [];
    var list_sede_id = [];

    carrerasMod.forEach(function (carrera) {
      if (carrera.provincias) {
        carrera.provincias.forEach(function (prov) {
          if (prov.id_provincia == provincia && !list_sede_id.includes(prov.id_sede)) {
            list_sede_id.push(prov.id_sede);
            listaSedes.push(prov);
          }
        });
      }
    });

    listaSedes.sort((a, b) => a.nombre_sede.localeCompare(b.nombre_sede));

    listaSedes.forEach(function (sede) {
      $("#cbx_sede").append(
        `<option value="${sede.id_sede}">${sede.nombre_sede}</option>`
      );
    });

    if (listaSedes.length === 1) {
      $("#cbx_sede").val($("#cbx_sede option:eq(1)").val());
      cargar_carreras();
    }
  } else {
    sedeSelect.setAttribute("disabled", "disabled");
    sedeSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";

    if (sedeWrapper) {
      sedeWrapper.classList.remove('enabled');
      sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una provincia primero');
    }
  }
}

function cargar_carreras() {
  const modo = document.getElementById('modo').value;
  const provincia = document.getElementById('cbx_provincia').value;
  const sede = document.getElementById('cbx_sede').value;
  const carreraSelect = document.getElementById('cbx_carrera');

  if (!carreraSelect) return;

  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  if (sede && provincia && modo) {
    carreraSelect.removeAttribute("disabled");
    carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600";

    let carrerasArray = JSON.parse(localStorage.getItem("CarrerasModGeneral") || "[]");

    const carrerasFiltradas = carrerasArray.filter(carrera => {
      if (carrera.modo != modo) return false;

      if (carrera.provincias) {
        return carrera.provincias.some(prov =>
          prov.id_provincia == provincia && prov.id_sede == sede
        );
      }
      return false;
    });

    carrerasFiltradas.sort((a, b) => a.nombre_carrera.localeCompare(b.nombre_carrera));

    carrerasFiltradas.forEach(function (carrera) {
      $("#cbx_carrera").append(
        `<option value="${carrera.codcar}">${carrera.nombre_carrera}</option>`
      );
    });

    if (carrerasFiltradas.length === 1) {
      $("#cbx_carrera").val($("#cbx_carrera option:eq(1)").val());
    }
  } else {
    carreraSelect.setAttribute("disabled", "disabled");
    carreraSelect.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }
}

function resetearFormulario() {
  const provinciaElement = document.getElementById('cbx_provincia');
  const sedeElement = document.getElementById('cbx_sede');
  const carreraElement = document.getElementById('cbx_carrera');

  const provinciaWrapper = provinciaElement?.closest('.select-wrapper');
  const sedeWrapper = sedeElement?.closest('.select-wrapper');

  $("#cbx_provincia").empty().append('<option value="" disabled selected>Provincia</option>');
  $("#cbx_sede").empty().append('<option value="" disabled selected>Sede</option>');
  $("#cbx_carrera").empty().append('<option value="" disabled selected>Carrera</option>');

  if (provinciaElement) {
    provinciaElement.setAttribute("disabled", "disabled");
    provinciaElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }

  if (sedeElement) {
    sedeElement.setAttribute("disabled", "disabled");
    sedeElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }

  if (carreraElement) {
    carreraElement.setAttribute("disabled", "disabled");
    carreraElement.className = "block w-full px-0 pt-2 pb-1 pl-2 text-sm text-black border border-gray-300 shadow-sm bg-white/80 focus:ring-blue-600 focus:border-blue-600 boton-inactivo-form";
  }

  if (provinciaWrapper) {
    provinciaWrapper.classList.remove('enabled');
    provinciaWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
  }
  if (sedeWrapper) {
    sedeWrapper.classList.remove('enabled');
    sedeWrapper.setAttribute('data-tooltip', 'Seleccioná una modalidad primero');
  }
}

function carreraForm(cod) {
  const carrerasString = window.localStorage.getItem("CarrerasModGeneral");
  if (!carrerasString) {
    console.error("Failed to load career data from local storage.");
    return;
  }

  const carrerasArray = JSON.parse(carrerasString);
  if (!carrerasArray || carrerasArray.length === 0) {
    console.error("No careers found in local storage.");
    return;
  }

  const carreraSeleccionada = carrerasArray.find(carrera => carrera.codcar == cod);
  if (!carreraSeleccionada) {
    console.error("Career not found:", cod);
    return;
  }

  $("#modo").val(carreraSeleccionada.modo);
  cambiar_modo();

  setTimeout(() => {
    if (carreraSeleccionada.provincias && carreraSeleccionada.provincias.length === 1) {
      const provincia = carreraSeleccionada.provincias[0];
      $("#cbx_provincia").val(provincia.id_provincia);
      cargar_sedes();

      setTimeout(() => {
        $("#cbx_sede").val(provincia.id_sede);
        cargar_carreras();

        setTimeout(() => {
          $("#cbx_carrera").val(cod);
        }, 100);
      }, 100);
    }
  }, 100);
}

function smoothScroll(event, id) {
  event.preventDefault();
  const section = document.getElementById(id);
  if (section) {
    var componentePosicion = section.offsetTop;
    window.scrollTo({
      top: componentePosicion - 110,
      behavior: 'smooth'
    });
  }
}

function reCALLBACK(token) {
  const btn = document.getElementById('formButton');
  if (!token || !btn) return;

  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  if (!form) return;

  const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let allFieldsCompleted = true;

  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      allFieldsCompleted = false;
    }
  });

  if (allFieldsCompleted) {
    btn.removeAttribute("disabled");
    btn.classList.add("boton-activo");
    btn.classList.remove("boton-inactivo-form");
  } else {
    btn.setAttribute("disabled", "disabled");
    btn.classList.remove("boton-activo");
    btn.classList.add("boton-inactivo-form");
  }

  window.recaptchaCompleted = true;
}

function check() {
  const form = document.getElementById('pedidoinfo') || document.querySelector('form');
  const btn = document.getElementById('formButton');
  const spinnerContainer = document.getElementById("spinnerContainer");

  if (!form || !btn || !spinnerContainer) return false;

  const codArea = document.getElementsByName("cod_area")[0];
  const tel = document.getElementsByName("tel")[0];

  if (codArea && tel) {
    const totalLength = codArea.value.length + tel.value.length;
    if (totalLength > 1 && totalLength < 10) {
      tel.setCustomValidity("Escribe Teléfono y Código de Área completos");
    } else {
      tel.setCustomValidity("");
    }
  }

  if (form.checkValidity()) {
    btn.classList.add("hidden");
    spinnerContainer.classList.remove("hidden");
    return true;
  } else {
    return false;
  }
}

function validarLongitudTelefono(inputTelefono, longitudMaxima) {
  if (!inputTelefono) return;

  var telefono = inputTelefono.value;
  var telefonoLimpio = telefono.replace(/\D/g, '');

  if (telefonoLimpio.length > longitudMaxima) {
    telefonoLimpio = telefonoLimpio.slice(0, longitudMaxima);
  }

  inputTelefono.value = telefonoLimpio;
}