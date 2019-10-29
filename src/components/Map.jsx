import React, { Component, Fragment } from "react";
import GoogleMapReact from "google-map-react";
import styled from "styled-components";
import { Icon } from "antd";
import { COLORS } from "../data/constants";

const Map = styled.div``;

const ALASKA_CENTER = {
  lat: 61.19,
  lng: -149.93
};

// InfoWindow component
const InfoWindow = props => {
  const { place } = props;
  const infoWindowStyle = {
    position: "relative",
    bottom: 0,
    left: "0px",
    width: 220,
    backgroundColor: "white",
    boxShadow: "0 2px 7px 1px rgba(0, 0, 0, 0.3)",
    padding: 10,
    fontSize: 14,
    zIndex: 100
  };

  return (
    <div style={infoWindowStyle}>
      <div style={{ fontSize: 16 }}>{place.name}</div>
    </div>
  );
};

const Marker = props => {
  const markerStyle = {
    border: "1px solid white",
    borderRadius: "50%",
    height: 10,
    width: 10,
    backgroundColor: props.show ? "red" : "blue",
    cursor: "pointer",
    zIndex: 10
  };

  return (
    <Fragment>
      <div style={markerStyle} />
      {props.show && <InfoWindow place={props.place} />}
    </Fragment>
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

  state = {
    markers: [],
    openWindow: null
  };

  componentWillMount() {
    this.asdMarkers = null;
    this.alaskaMarkers = null;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedDataset !== this.props.selectedDataset) {
      if (this.state.openWindow) {
        this.state.openWindow.close();
      }
      this.updateMarkers();
      // if (this.props.selectedDataset === "1") {
      //   this.setZoom(11);
      //   this.setGlobalCenter();
      // } else {
      //   this.setZoom(4);
      //   this.setGlobalCenter();
      // }
    }
    // if (
    //   prevProps.selectedSchoolCoordinates !==
    //   this.props.selectedSchoolCoordinates
    // ) {
    //   if (!this.props.selectedSchoolCoordinates) {
    //     debugger;
    //     return;
    //   }
    //   const { lat, lng } = this.props.selectedSchoolCoordinates;
    //   const center = new window.g_maps.LatLng(lat, lng);
    //   window.g_map.panTo(center);
    // }
  }

  setGlobalCenter(lat = ALASKA_CENTER.lat, lng = ALASKA_CENTER.lng) {
    const center = new window.g_maps.LatLng(lat, lng);
    window.g_map.panTo(center);
    // window.g_map && window.g_map.setCenter(new window.g_maps.LatLng(lat, lng));
  }

  setZoom(zoomLevel) {
    window.g_map && window.g_map.setZoom(zoomLevel);
  }

  makeInfoWindow(g_maps, school, scores) {
    if (scores) {
      return new g_maps.InfoWindow({
        content: `
        <div>
          <p>Name:${school}</p>
          <p>
            ${scores["ELA"]}% Below Proficiency in ELA:
          </p>
          <p>
            ${scores["Math"]}% Below Proficiency in Math:
          </p>
        </div>`,
        maxWidth: 200
      });
    } else {
      return;
    }
  }

  makeMarkers(g_map, g_maps) {
    const { selectedScores, selectedDistrictCoordinates } = this.props;

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

    const formatScores = school => {
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

    const finalMarkers = Object.keys(selectedDistrictCoordinates).map(
      marker => {
        const currentScores = formatScores(marker);
        let averageScore = null;

        if (currentScores) {
          averageScore = (currentScores.Math + currentScores.ELA) / 2;
        }

        const infoWindow = this.makeInfoWindow(g_maps, marker, currentScores);
        const color = getIconColor(averageScore);

        const icon = {
          path: g_maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: color,
          strokeColor: color
        };

        const newMarker = new g_maps.Marker({
          position: {
            lat: selectedDistrictCoordinates[marker].lat,
            lng: selectedDistrictCoordinates[marker].lng
          },
          map: g_map,
          maxWidth: 50,
          icon
        });

        newMarker.addListener("click", () => {
          if (this.state.openWindow) {
            this.state.openWindow.close();
          }

          this.setState({ openWindow: infoWindow });
          infoWindow.open(g_map, newMarker);

          this.props.switchSchoolAndFetch(marker);
        });
      }
    );

    this.setState({ markers: finalMarkers });
  }

  getMapBounds = (map, maps, places) => {
    const bounds = new maps.LatLngBounds();

    places.forEach(place => {
      bounds.extend(new maps.LatLng(place.props.lat, place.props.lng));
    });
    return bounds;
  };

  apiIsLoaded = (map, maps, places) => {
    // Get bounds by our places
    const bounds = this.getMapBounds(map, maps, places);
    // Fit map to bounds
    map.fitBounds(bounds);
    // Bind the resize listener
    this.bindResizeListener(map, maps, bounds);
  };

  bindResizeListener = (map, maps, bounds) => {
    maps.event.addDomListenerOnce(map, "idle", () => {
      maps.event.addDomListener(window, "resize", () => {
        map.fitBounds(bounds);
      });
    });
  };

  onChildClickCallback(key) {
    this.props.toggleShowInfo(key);
    // this.setState(state => {
    //   const index = state.places.findIndex(e => e.name === key);
    //   state.places[index].show = !state.places[index].show; // eslint-disable-line no-param-reassign
    //   return { places: state.places };
    // });
  }

  updateMarkers(cb = () => {}) {
    const { selectedDistrictCoordinates } = this.props;
    const preLoadedmarkers =
      this.props.selectedDataset === "1" ? this.asdMarkers : this.alaskaMarkers;

    const finalMarkers = preLoadedmarkers
      ? preLoadedmarkers
      : Object.keys(selectedDistrictCoordinates).map(marker => {
          return (
            <Icon
              type="home"
              key={marker}
              text={marker}
              lat={selectedDistrictCoordinates[marker].lat}
              lng={selectedDistrictCoordinates[marker].lng}
              onClick={() => {
                this.props.switchSchoolAndFetch(marker);
              }}
            />
          );
        });

    if (this.props.selectedDataset === "1") {
      this.asdMarkers = finalMarkers;
    } else {
      this.alaskaMarkers = finalMarkers;
    }

    this.setState({ markers: finalMarkers }, () => cb(finalMarkers));
  }

  render() {
    const { height, zoom, places } = this.props;

    let selectedPlaces;
    if (this.props.selectedDataset === "1") {
      selectedPlaces = places.asd;
    } else {
      selectedPlaces = places.alaska;
    }

    return (
      // TODO: ZOOM IS NOT FUCKING UPDATING
      // Important! Always set the container height explicitly
      <Map style={{ height, width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyAM_iXHF7lBSpOtMMcCkA7N8t70AkqPDmE" }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          zoom={zoom}
          onChildClick={key => this.onChildClickCallback(key)}
          onGoogleApiLoaded={({ map, maps }) => {
            this.setState({ map, maps, loadedMaps: true }, () => {
              // this.updateMarkers(markers => {
              //   this.apiIsLoaded(map, maps, markers);
              // });
              // this.makeMarkers(map, maps);
            });

            window.g_map = map;
            window.g_maps = maps;
            console.log(map, maps);
          }}
          yesIWantToUseGoogleMapApiInternals
        >
          {selectedPlaces.map(place => (
            <Marker
              key={place.name}
              lat={place.lat}
              lng={place.lng}
              show={place.show}
              place={place}
            />
          ))}
          {/* {this.state.markers} */}
        </GoogleMapReact>
      </Map>
    );
  }
}

export default SimpleMap;
