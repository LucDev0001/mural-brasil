export function createBrazilMap(id) {
  const map = L.map(id, {
    zoomControl: true,
    minZoom: 4,
    maxZoom: 15,
  }).setView([-14.235, -51.9253], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  return map;
}

export function fitBrazilBounds(map) {
  const bounds = L.latLngBounds(
    L.latLng(-33.75, -73.99),
    L.latLng(5.27, -34.79),
  );
  map.fitBounds(bounds);
}

export function addMarkersToMap(map, items) {
  const markers = L.markerClusterGroup();

  const validItems = items.filter(
    (item) => Number.isFinite(item.lat) && Number.isFinite(item.lng),
  );

  validItems.forEach((item) => {
    const popup = `
      <div style="min-width:240px">
        <strong>${escapeHtml(item.titulo || "Contribuição pública")}</strong><br>
        <small>${escapeHtml(item.cidade || "")} - ${escapeHtml(item.estado || "")}</small>
        <p style="margin-top:8px;line-height:1.5;">
          ${escapeHtml((item.mensagem || "").slice(0, 140))}
          ${(item.mensagem || "").length > 140 ? "..." : ""}
        </p>
        <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
          <span class="text-xs text-slate-500 vote-count-${item.id}">${item.votos || 0} concordam</span>
          <button data-vote-id="${item.id}" class="vote-btn rounded bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/30">Concordar</button>
        </div>
      </div>
    `;

    const marker = L.circleMarker([item.lat, item.lng], {
      radius: 8,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85,
      color: "#86efac",
      fillColor: "#22c55e",
    });

    marker.bindPopup(popup);
    markers.addLayer(marker);
  });

  map.addLayer(markers);
}

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
