//pk.eyJ1IjoiY2hlbjdyNyIsImEiOiJjbDNrMWNybXcwbW00M2RvN2UyZ2NobWg1In0.gqj6uNYQgjVZLA9yE0AoHw
mapboxgl.accessToken = mapToken;
//console.log(campground);
const map = new mapboxgl.Map({
    container: 'map', // container ID
    //style: 'mapbox://styles/mapbox/streets-v11', // style URL
    style: 'mapbox://styles/mapbox/light-v10',
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});
//campground.geometry.coordinates
//campground.geometry.coordinates
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )
    .addTo(map)