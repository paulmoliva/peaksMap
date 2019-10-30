import React from "react";
import styled from "styled-components";
import { Icon, Typography } from "antd";
import { COLORS } from "../data/constants";

const { Paragraph, Text } = Typography;

// MakerInfoWindow
// https://github.com/google-map-react/google-map-react-examples/blob/master/src/examples/MarkerInfoWindow.js

const InfoWindow = ({ place, toggleShowInfo, scores }) => {
  const InfoWindowContainer = styled.div`
    position: absolute;
    width: 260px;
    background: white;
    box-shadow: 0 2px 7px 1px rgba(0, 0, 0, 0.3);
    padding: 10px;
    font-size: 14px;
    color: black;
    z-index: 100;

    bottom: 40px;
    left: 0;
  `;

  const TopHalf = styled.div``;

  const BottomHalf = styled.div`
    padding: 5px;
    margin-top: 15px;
  `;

  const CloseButton = styled(Icon)`
    font-size: 14px;
    position: absolute;
    right: 10px;
    padding: 5px;
    &:hover {
      cursor: pointer;
      background: white;
    }
  `;

  const BottomArrow = styled(Icon)`
    position: absolute;
    font-size: 35px;
    /* border: 1px solid red; */
    bottom: -20px;
    left: 0;
    color: white;
  `;


  return (
    <InfoWindowContainer>
      <TopHalf>
        <CloseButton
          type="close"
          onClick={() => {
            toggleShowInfo(place.name);
          }}
        />
      </TopHalf>
      <BottomHalf>
        <Paragraph style={{ fontSize: "16px" }}>
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
      </BottomHalf>
      <BottomArrow type="caret-down" theme="filled" />
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
  let formattedScores;
  if (!currentScoresRaw) {
    return null;
  } else {
    formattedScores = {
      Math: parseInt(currentScoresRaw["Math"]),
      ELA: parseInt(currentScoresRaw["ELA"])
    };
  }

  if (Number.isNaN(formattedScores.Math) || Number.isNaN(formattedScores.ELA)) {
    return null;
  } else {
    return formattedScores;
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
      <MarkerIcon type="home" theme="filled" color={color} />
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
export default Marker;
