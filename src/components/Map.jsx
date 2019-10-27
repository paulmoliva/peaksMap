import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import { Icon } from 'antd';
 
 
class SimpleMap extends Component {
  static defaultProps = {
    center: {
      lat: 61.19,
      lng: -149.93
    },
    zoom: 11
  };
 
  render() {
    const { children, height } = this.props;
    const iconStyle = {
      pointer: 'cursor'
    }
    return (
      // Important! Always set the container height explicitly
      <div style={{ height, width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyAM_iXHF7lBSpOtMMcCkA7N8t70AkqPDmE' }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
        >
          {children}
          {/* <Icon
            lat={61.1955413}
            lng={-149.9337844}
            type='home'
            theme='twoTone'
            twoToneColor='#eb2f96'
            onClick={() => this.props.slideOut()}
          />
          <Icon
            lat={61.1905413}
            lng={-149.9337844}
            type='home'
            theme='twoTone'
            twoToneColor='#52c41a'
            onClick={() => this.props.slideOut()}
          /> */}
        </GoogleMapReact>
      </div>
    );
  }
}
 
export default SimpleMap;