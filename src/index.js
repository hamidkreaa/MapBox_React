import React from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";

import "./styles.css";

function App() {
  return <Map />;
}

class Map extends React.Component {
  componentDidMount() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiaWRtY2RhIiwiYSI6ImNqY2JyNDZzazBqa2gycG8yNTh2eHM4dGYifQ.EOazpb8QxCCEKhhtrVjnYA";
    var map = new mapboxgl.Map({
      container: "map", // container id
      style: "mapbox://styles/idmcda/cjasa8fvu6hp92spaeobt52k6", // stylesheet location
      center: [0, 0], // starting position [lng, lat]
      zoom: 2 // starting zoom
    });

    map.on("load", function() {
      const url = "https://backend.idmcdb.org/data/idus_view_flat";

      fetch(url)
        .then(response => response.json())
        .then(json => {
          const results = json;
          //console.log(results);

          var geojson = {
            type: "FeatureCollection",
            features: results.map(item => {
              return {
                type: "Feature",
                properties: {
                  descriptionPop: item.standard_popup_text,
                  descriptionHover: item.standard_info_text,
                  circleColor: item.displacement_type
                  //  "icon": "theatre"
                },
                geometry: {
                  type: "Point",
                  coordinates: [item.longitude, item.latitude]
                }
              };
            })
          };

          map.addSource("point", {
            type: "geojson",
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 20 // Radius of each cluster when clustering points (defaults to 50)
          });

          map.addLayer({
            id: "point",
            type: "circle",
            source: "point",
            paint: {
              "circle-radius": 10,
              "circle-color": {
                property: "circleColor", // geojson property based on which you want too change the color
                type: "categorical",
                stops: [
                  ["Conflict", "#ee7d00"],
                  ["Disaster", "#008dcc"],
                  ["Development", "#33953e"]
                ]
              }
            }
          });
        });
    });
    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl({ position: "top-left" }));

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on("click", "point", function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description2 = e.features[0].properties.descriptionPop;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description2)
        .addTo(map);
    });

    map.on("mouseenter", "point", function(e) {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = "pointer";

      var coordinates = e.features[0].geometry.coordinates.slice();
      var description1 = e.features[0].properties.descriptionHover;

      // console.log(description1);
      // console.log(coordinates);

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup
        .setLngLat(coordinates)
        .setHTML(description1)
        .addTo(map);
    });

    map.on("mouseleave", "point", function() {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });
  }

  render() {
    return (
      <div>
        <div id="map" />
        <div id="legend" class="legend">
          <h4>Internal Displacement Updates</h4>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
