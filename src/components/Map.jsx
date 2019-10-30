import React, { Component, Fragment } from "react";
import GoogleMapReact from "google-map-react";
import styled from "styled-components";
import { Icon, Popover, Typography } from "antd";
import { COLORS } from "../data/constants";

const { Paragraph, Text } = Typography;

// https://github.com/google-map-react/google-map-react-examples

// MakerInfoWindow
// https://github.com/google-map-react/google-map-react-examples/blob/master/src/examples/MarkerInfoWindow.js

const Map = styled.div``;

const ALASKA_CENTER = {
  lat: 61.19,
  lng: -149.93
};

const GOOGLE_MAPS_API_KEY = "AIzaSyAM_iXHF7lBSpOtMMcCkA7N8t70AkqPDmE";

// InfoWindow component
const InfoWindow = ({ place, toggleShowInfo, scores }) => {
  const InfoWindowContainer = styled.div`
    position: absolute;
    width: 220px;
    background: white;
    box-shadow: 0 2px 7px 1px rgba(0, 0, 0, 0.3);
    padding: 10px;
    font-size: 14px;
    color: black;
    bottom: 20px;
    left: -60px;
    z-index: 100;
  `;

  const CloseButton = styled(Icon)`
    font-size: 14px;
    position: absolute;
    right: 10px;
    &:hover {
      cursor: pointer;
      background: white;
    }
  `;

  return (
    <InfoWindowContainer>
      <CloseButton
        type="close"
        onClick={() => {
          toggleShowInfo(place.name);
        }}
      />
      <Paragraph>
        <Text strong>{place.name}</Text>
      </Paragraph>
      {scores ? (
        <div>
          <Paragraph>
            <Text strong>{scores["ELA"]}%</Text> below proficiency in ELA
          </Paragraph>
          <Paragraph>
            <Text strong>{scores["Math"]}%</Text> below proficiency in Math
          </Paragraph>
        </div>
      ) : (
        <div>
          <Paragraph>No data found.</Paragraph>
        </div>
      )}
    </InfoWindowContainer>
  );
};

const MarkerIcon = styled(Icon)`
  &:hover {
    cursor: pointer;
  }
  color: ${props => props.color};
  font-size: 15px;
`;

const MarkerContainer = styled.div`
  position: relative;
`;

const getIconColor = averageScore => {
  if (!averageScore) {
    return "white";
  }

  if (averageScore < 31) {
    return COLORS.GREEN;
  } else if (averageScore >= 31 && averageScore < 51) {
    return COLORS.YELLOW;
  } else {
    return COLORS.RED;
  }
};

const formatScores = (school, selectedScores) => {
  const currentScoresRaw = selectedScores[school];

  if (!currentScoresRaw) {
    return null;
  } else {
    return {
      Math: parseInt(currentScoresRaw["Math"]),
      ELA: parseInt(currentScoresRaw["ELA"])
    };
  }
};

const Marker = ({ place, toggleShowInfo, show, selectedScores }) => {
  const currentScores = formatScores(place.name, selectedScores);
  let averageScore = null;

  if (currentScores) {
    averageScore = (currentScores.Math + currentScores.ELA) / 2;
  }

  const color = getIconColor(averageScore);

  return (
    <MarkerContainer>
      <MarkerIcon type="home" color={color} />
      {show && (
        <InfoWindow
          scores={currentScores}
          place={place}
          toggleShowInfo={toggleShowInfo}
        />
      )}
    </MarkerContainer>
  );
};

class SimpleMap extends Component {
  static defaultProps = {
    center: {
      ...ALASKA_CENTER
    },
    map: null,
    maps: null,
    loadedMaps: false,
    zoom: 11
  };

  state = Object.freeze({
    markers: [],
    openWindow: null,
    apiIsLoaded: false
  });

  componentDidUpdate(prevProps) {
    if (prevProps.selectedDataset !== this.props.selectedDataset) {
      if (this.state.apiIsLoaded) {
        this.fitBounds(window.g_map, window.g_maps, this.getSelectedPlaces());
      }
    }
    if (
      prevProps.selectedSchoolCoordinates !==
      this.props.selectedSchoolCoordinates
    ) {
      if (!this.props.selectedSchoolCoordinates) {
        return;
      }
      // const { lat, lng } = this.props.selectedSchoolCoordinates;
      // this.setGlobalCenter(lat, lng);
      // const center = new window.g_maps.LatLng(lat, lng);
      // window.g_map.panTo(center);
    }
  }

  getSelectedPlaces() {
    const { places, selectedDataset } = this.props;

    if (selectedDataset === "1") {
      return places.asd;
    } else {
      return places.alaska;
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
    const bounds = this.fitBounds(map, maps, places);

    this.bindResizeListener(map, maps, bounds);
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
  }

  render() {
    const { height, zoom } = this.props;
    const selectedPlaces = this.getSelectedPlaces();

    return (
      // TODO: ZOOM IS NOT FUCKING UPDATING
      // Important! Always set the container height explicitly
      <Map style={{ height, width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          zoom={zoom}
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
