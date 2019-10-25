import React from "react";
import styled from "styled-components";
import { Typography } from "antd";
const { Title, Paragraph } = Typography;

const SideBarStyle = styled.div`
  background: white;
`;

const WelcomeDetailsStyle = styled.div`
  padding: 5px;
`;

const WelcomeDetails = () => (
  <WelcomeDetailsStyle>
    <Title>PEAKS Data Map</Title>
    <Paragraph>
      Welcome to the Alaska Policy Forum Interactive Performance Evaluation for
      Alaska's Schools (PEAKS) Data Map.
    </Paragraph>
    <Paragraph>
      Click a pin on the map to view test scores for that school.
    </Paragraph>
    <Paragraph>Click the + or - on the map to zoom in and out.</Paragraph>
    <Paragraph>
      Alternatively, type a school name into the search bar and select the
      corresponding search result.
    </Paragraph>
  </WelcomeDetailsStyle>
);

export default () => (
  <SideBarStyle>
    <WelcomeDetails />
  </SideBarStyle>
);
