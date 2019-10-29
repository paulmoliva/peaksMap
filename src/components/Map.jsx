import React, { Component } from "react";
import GoogleMapReact from "google-map-react";
import styled from "styled-components";
import { Icon } from "antd";
import { COLORS } from "../data/constants";
import { tsObjectKeyword } from "@babel/types";

const Map = styled.div``;

const ALASKA_CENTER = {
  lat: 61.19,
  lng: -149.93
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

  componentDidUpdate(prevProps) {
    if (prevProps.selectedDataset !== this.props.selectedDataset) {
      if (this.state.openWindow) {
        this.state.openWindow.close();
      }

      if (this.props.selectedDataset === "1") {
        this.setZoom(11);
        this.setGlobalCenter();
      } else {
        this.setZoom(4);
        this.setGlobalCenter();
      }
    }

    if (
      prevProps.selectedSchoolCoordinates !==
      this.props.selectedSchoolCoordinates
    ) {
      if (!this.props.selectedSchoolCoordinates) {
        debugger;
        return;
      }

      const { lat, lng } = this.props.selectedSchoolCoordinates;
      const center = new window.g_maps.LatLng(lat, lng);
      window.g_map.panTo(center);
      // this.setZoom(8);
    }
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
  render() {
    const { height, zoom } = this.props;

    return (
      // TODO: ZOOM IS NOT FUCKING UPDATING
      // Important! Always set the container height explicitly
      <Map style={{ height, width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyAM_iXHF7lBSpOtMMcCkA7N8t70AkqPDmE" }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          zoom={zoom}
          onGoogleApiLoaded={({ map, maps }) => {
            this.setState({ map, maps, loadedMaps: true }, () => {
              this.makeMarkers(map, maps);
            });

            window.g_map = map;
            window.g_maps = maps;
            console.log(map, maps);
          }}
          yesIWantToUseGoogleMapApiInternals
        >
          {/* {this.state.markers} */}
        </GoogleMapReact>
      </Map>
    );
  }
}

export default SimpleMap;
