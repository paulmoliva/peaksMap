import React, { Component } from "react";
import GoogleMapReact from "google-map-react";
import styled from "styled-components";
import Marker from './Marker';
// https://github.com/google-map-react/google-map-react-examples

const Map = styled.div``;

const ALASKA_CENTER = {
  lat: 61.19,
  lng: -149.93
};

const ASD_CENTER = {
  lat: 61.2077052,
  lng: -149.7016999
};

const GOOGLE_MAPS_API_KEY = "AIzaSyAM_iXHF7lBSpOtMMcCkA7N8t70AkqPDmE";


class SimpleMap extends Component {
  static defaultProps = {
    center: 'asd',
    map: null,
    maps: null,
    loadedMaps: false,
    zoom: 10
  };

  state = Object.freeze({
    markers: [],
    openWindow: null,
    apiIsLoaded: false
  });

  componentDidUpdate(prevProps) {
    if (prevProps.selectedDataset !== this.props.selectedDataset) {
      if (this.state.apiIsLoaded) {
        const center = this.props.selectedDataset === 'asd' ? ASD_CENTER : ALASKA_CENTER;
      }
    }
    if (
      prevProps.selectedSchoolCoordinates !==
      this.props.selectedSchoolCoordinates
    ) {
      if (!this.props.selectedSchoolCoordinates || !window.g_maps) {
        console.log("error zooming to new location!");
      } else {
        const { lat, lng } = this.props.selectedSchoolCoordinates;
        const center = new window.g_maps.LatLng(lat, lng);
        window.g_map.panTo(center);
      }
    }
  }

  setGlobalCenter(lat = ALASKA_CENTER.lat, lng = ALASKA_CENTER.lng) {
    if (!window.g_map) return;

    const center = new window.g_maps.LatLng(lat, lng);
    window.g_map.panTo(center);
  }

  // setZoom(zoomLevel) {
  //   window.g_map && window.g_map.setZoom(zoomLevel);
  // }
  getMapBounds = (map, maps, places) => {
    const bounds = new maps.LatLngBounds();

    places.forEach(place => {
      bounds.extend(new maps.LatLng(place.lat, place.lng));
    });
    return bounds;
  };

  apiIsLoaded = (map, maps, places) => {
    // const bounds = this.fitBounds(map, maps, places);

    // this.bindResizeListener(map, maps, bounds);
    this.setState({ apiIsLoaded: true });
  };

  fitBounds(map, maps, places) {
    // Get bounds by our places
    const bounds = this.getMapBounds(map, maps, places);
    // Fit map to bounds
    map.fitBounds(bounds);
    // Bind the resize listener
    return bounds;
  }

  bindResizeListener = (map, maps, bounds) => {
    maps.event.addDomListenerOnce(map, "idle", () => {
      maps.event.addDomListener(window, "resize", () => {
        map.fitBounds(bounds);
      });
    });
  };

  onChildClickCallback(key) {
    this.props.toggleShowInfo(key);
    this.props.switchSchoolAndFetch(key);
  }

  render() {
    const { height, zoom, selectedPlaces } = this.props;

    return (
      // TODO: ZOOM IS NOT FUCKING UPDATING
      // Important! Always set the container height explicitly
      <Map style={{ height, width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
          defaultCenter={ASD_CENTER}
          defaultZoom={this.props.selectedDataset === 'asd' ? 10 : 4}
          onChildClick={key => this.onChildClickCallback(key)}
          onGoogleApiLoaded={({ map, maps }) => {
            this.setState({ map, maps, loadedMaps: true }, () => {
              this.apiIsLoaded(map, maps, selectedPlaces);
            });

            window.g_map = map;
            window.g_maps = maps;
          }}
          yesIWantToUseGoogleMapApiInternals
        >
          {selectedPlaces.map(place => (
            <Marker
              toggleShowInfo={key => this.props.toggleShowInfo(key)}
              selectedScores={this.props.selectedScores}
              key={place.name}
              lat={place.lat}
              lng={place.lng}
              show={place.show}
              place={place}
            />
          ))}
        </GoogleMapReact>
      </Map>
    );
  }
}

export default SimpleMap;
