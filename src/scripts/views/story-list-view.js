import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class PointListView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
    this.map = null;
    this.currentPoint = null;
    this.mapReports = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  showLocationError() {
    alert('Cerita ini tidak memiliki data lokasi.');
  }

  renderLoading() {
    this.container.innerHTML = '<h2>Memuat cerita...</h2>';
  }

  renderError(message) {
    this.container.innerHTML = `<p class="text-red-600">${message}</p>`;
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  renderPointList(points) {
    this.container.innerHTML = `
        <div class="container mx-auto px-4">
          <a href="#point-list" class="skip-link">Lewati ke konten utama</a>

          <h2 class="font-bold mb-4 text-xl" id="point-list-heading" style="text-align: center">
            Daftar Cerita
          </h2>

          <section>
            <div class="reports-map-container">
              <div id="map-reports" class="reports-map-container"></div>
              <div id="map-loading-container"></div>
            </div>
          </section>

          <div
            id="point-list"
            tabindex="-1"
            role="main"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            role="list"
            aria-labelledby="point-list-heading"
          ></div>

          <h2 id="modal-title" class="sr-only">Detail Cerita</h2>

          <div
            id="map-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="point-description point-created"
            style="
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.7);
              justify-content: center;
              align-items: center;
              z-index: 1000;
            "
          >
            <div
              id="modal-content"
              tabindex="-1"
              aria-label="Detail lokasi cerita dalam peta"
              style="
                width: 90%;
                max-width: 800px;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                outline: none;
                box-shadow: 0 10px 30px rgba(0,0,0,0.4);
              "
            >
              <div
                id="map"
                style="width: 100%; height: 300px;"
                aria-hidden="true"
              ></div>
              <div id="point-detail" style="padding: 1rem;" aria-live="polite">
                <h3 id="point-title" class="font-bold mb-4"></h3>
                <p id="point-description"></p>
                <small id="point-created"></small>
              </div>
            </div>
          </div>
        </div>
`;

    if (!points.length) {
      this.container.innerHTML = '<h2 class="font-bold mb-4 text-xl">Belum ada cerita</h2>';
      return;
    }

    const mainContent = document.querySelector("#point-list");
    const skipLink = document.querySelector(".skip-link");
    const listEl = this.container.querySelector('#point-list');
    const mapModal = this.container.querySelector('#map-modal');
    const modalContent = this.container.querySelector('#modal-content');
    const mapEl = document.querySelector('#map-reports');

    L.Marker.prototype.options.icon = L.icon({
          iconUrl: 'https:unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
          shadowUrl: 'https:unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          shadownAnchor: [12, 41]
        });

    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });

    points.forEach((point, index) => {
      const item = document.createElement('article');
      item.className = 'bg-white rounded-xl shadow-md overflow-hidden p-4 flex flex-col gap-2 text-sm hover:shadow-lg transition-shadow duration-200';
      item.setAttribute('tabindex', '0');
      item.innerHTML = `
    <img src="${point.photoUrl}" alt="Foto dari ${point.description}" class="w-full h-auto rounded-md cursor-pointer object-cover" loading="lazy" />
    <h3 class="text-lg font-semibold">${point.description}</h3>
    <p class="text-gray-700">${point.description}</p>
    <p class="text-gray-700">Jenis titik: ${point.type}</p>
    <p class="text-gray-700">Status aktif/tidak aktif: ${point.status}</p>
    <small class="text-gray-500">Dibuat: ${point.createdAt ? new Date(point.createdAt.toDate ? point.createdAt.toDate() : point.createdAt).toLocaleString() : 'Tanggal tidak tersedia'}</small>
    <button class="delete-button bg-red-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-red-600" style="color: white;">Hapus</button>
  `;

      item.style.cursor = 'pointer';
      item.addEventListener('click', (event) => {
        if (!event.target.classList.contains('delete-button')) {
          this.presenter.onPointSelected(index);
        }
      });
      listEl.appendChild(item);

      const deleteButton = item.querySelector('.delete-button');
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();  
        if (confirm('Apakah Anda yakin ingin menghapus cerita ini?')) {
          this.presenter.onDeletePointClicked(point.id);
        }
      });
    });

    mapModal.addEventListener('click', e => {
      if (e.target === mapModal) {
        mapModal.style.display = 'none';
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mapModal.style.display === 'flex') {
        mapModal.style.display = 'none';
      }
    });

    mapModal.addEventListener('keydown', e => {
      const focusableElements = modalContent.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    });

    if (!this.mapReports) {
      this.mapReports = L.map(mapEl).setView([-2.5, 118], 5);
      const baseLayers = {
        "OpenStreetMap": L.tileLayer('https:{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }),
        "OpenTopoMap": L.tileLayer('https:{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; OpenTopoMap contributors'
        }),
        "Esri World Imagery": L.tileLayer('https:server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
      };
      baseLayers["OpenStreetMap"].addTo(this.mapReports);
      L.control.layers(baseLayers).addTo(this.mapReports);
    } else {
      this.mapReports.eachLayer(layer => {
        if (layer instanceof L.Marker) this.mapReports.removeLayer(layer);
      });
    }


    points.forEach((point) => {
      if (point.latitude && point.longitude) { 
        L.marker([point.latitude, point.longitude]) 
          .addTo(this.mapReports)
          .bindPopup(`
            <strong>${point.description}</strong><br>
            <a href="https://www.google.com/maps?q=${point.latitude}${point.longitude}" target="_blank" rel="noopener">
              ${point.latitude}, ${point.longitude}
            </a>
          `)   
      }
    });
  }

  async renderPoint(point) {
    this.currentPoint = point;
    const pointTitle = this.container.querySelector('#point-title');
    const pointDesc = this.container.querySelector('#point-description');
    const pointCreated = this.container.querySelector('#point-created');
    const mapModal = this.container.querySelector('#map-modal');
    const modalContent = this.container.querySelector('#modal-content');

    L.Marker.prototype.options.icon = L.icon({
          iconUrl: 'https:unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
          shadowUrl: 'https:unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          shadownAnchor: [12, 41]
        });

    mapModal.style.display = 'flex';
    modalContent.focus();

    pointTitle.textContent = point.description; 
    pointDesc.textContent = point.description; 
    pointCreated.textContent = `Dibuat: ${point.createdAt ? new Date(point.createdAt.toDate ? point.createdAt.toDate() : point.createdAt).toLocaleString() : 'Tanggal tidak tersedia'}`; 

    if (this.map === null) {
      const mapEl = this.container.querySelector('#map');
      this.map = L.map(mapEl).setView([point.latitude, point.longitude], 13); 

      const baseLayers = {
        "OpenStreetMap": L.tileLayer('https:{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }),
        "OpenTopoMap": L.tileLayer('https:{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; OpenTopoMap contributors'
        }),
        "Esri World Imagery": L.tileLayer('https:server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
      };
      baseLayers["OpenStreetMap"].addTo(this.map);
      L.control.layers(baseLayers).addTo(this.map);
    } else {
      this.map.setView([point.latitude, point.longitude], 13); 
    }

    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });
    L.marker([point.latitude, point.longitude]).addTo(this.map) 
    .bindPopup(`
      <strong>${point.description}</strong><br>
      <a href="https://www.google.com/maps?q=${point.latitude}${point.longitude}" target="_blank" rel="noopener">
        ${point.latitude}, ${point.longitude}
      </a>
    `) 
      .openPopup();
  }
}
