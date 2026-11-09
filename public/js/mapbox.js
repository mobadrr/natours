export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibW8xNDExIiwiYSI6ImNtdmpjNXMxMzBhd2wyeXNqbjVjNGs5cWkifQ.fY9tWgKuWsvmSccHsFlMlg';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    scrollZoom: false,
    focusAfterOpen: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
      closeOnClick: false,
      focusAfterOpen: false
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    },
    maxZoom: 10
  });
};
