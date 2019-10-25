import React from "react";
import styled from "styled-components";
import { Typography } from "antd";
import Map from "./Map";

const { Title, Paragraph } = Typography;

const MapContainer = styled.div`
  position: relative;
`;
const Legend = styled.div`
  width: 300px;
  height: 200px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: #7a7979;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const ColorSquare = styled.div`
  background: ${props => props.color};
  width: 30px;
  height: 20px;
  margin-right: 10px;
`;

const LegendItemStyle = styled.div`
  color: white;
  display: flex;
  padding-left: 20px;
`;

const LegendItem = ({ initialRange, finalRange }) => {
  let color;
  if (initialRange === 0) {
    color = "#25B46F";
  } else if (initialRange === 31) {
    color = "#C2B00C";
  } else {
    color = "#931A1A";
  }

  return (
    <LegendItemStyle className="LegendItemStyle">
      <ColorSquare color={color} className="ColorSquare" />
      <Paragraph style={{ color: "white" }}>
        {initialRange}% - {finalRange}% below proficiency
      </Paragraph>
    </LegendItemStyle>
  );
};

export default ({ children }) => (
  <MapContainer>
    <Map>{children}</Map>
    <Legend className="Legend">
      <LegendItem initialRange={0} finalRange={30}></LegendItem>
      <LegendItem initialRange={31} finalRange={50}></LegendItem>
      <LegendItem initialRange={51} finalRange={100}></LegendItem>
    </Legend>
  </MapContainer>
);