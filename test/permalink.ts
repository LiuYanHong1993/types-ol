import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

// default zoom, center and rotation
let zoom = 2;
let center = [0, 0];
let rotation = 0;

if (window.location.hash !== '') {
    // try to restore center, zoom-level and rotation from the URL
    const hash = window.location.hash.replace('#map=', '');
    const parts = hash.split('/');
    if (parts.length === 4) {
        zoom = parseInt(parts[0], 10);
        center = [parseFloat(parts[1]), parseFloat(parts[2])];
        rotation = parseFloat(parts[3]);
    }
}

const map = new Map({
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
    ],
    target: 'map',
    view: new View({
        center,
        zoom,
        rotation,
    }),
});

let shouldUpdate = true;
const view = map.getView();
const updatePermalink = () => {
    if (!shouldUpdate) {
        // do not update the URL when the view was changed in the 'popstate' handler
        shouldUpdate = true;
        return;
    }

    const center_ = view.getCenter()!;
    const hash = `#map=${view.getZoom()}/${Math.round(center_[0] * 100) / 100}/${
        Math.round(center_[1] * 100) / 100
    }/${view.getRotation()}`;
    const state = {
        zoom: view.getZoom(),
        center_: view.getCenter(),
        rotation: view.getRotation(),
    };
    window.history.pushState(state, 'map', hash);
};

map.on('moveend', updatePermalink);

// restore the view state when navigating through the history, see
// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
window.addEventListener('popstate', event => {
    if (event.state === null) return;

    map.getView().setCenter(event.state.center);
    map.getView().setZoom(event.state.zoom);
    map.getView().setRotation(event.state.rotation);
    shouldUpdate = false;
});
