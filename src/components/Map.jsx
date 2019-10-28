import React, { Component } from "react";
import GoogleMapReact from "google-map-react";
import { Icon } from "antd";

class SimpleMap extends Component {
  static defaultProps = {
    center: {
      lat: 61.19,
      lng: -149.93
    },
    map: null,
    maps: null,
    loadedMaps: false,
    zoom: 11
  };

  render() {
    const { children, height, zoom } = this.props;
    const iconStyle = {
      pointer: "cursor"
    };
    return (
      // TODO: ZOOM IS NOT FUCKING UPDATING
      // Important! Always set the container height explicitly
      <div style={{ height, width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyAM_iXHF7lBSpOtMMcCkA7N8t70AkqPDmE" }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          zoom={zoom}
          onGoogleApiLoaded={({ map, maps }) => {
            this.setState({ map, maps, loadedMaps: true });
            console.log(map, maps);
          }}
          yesIWantToUseGoogleMapApiInternals
        >
          {children}
        </GoogleMapReact>
      </div>
    );
  }
}

export default SimpleMap;
