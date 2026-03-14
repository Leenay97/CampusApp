import { gql } from '@apollo/client';

export const UPDATE_TECHNICAL_DATA = gql`
  mutation UpdateTecnhicalData(
    $workshopValue: Int
    $sportTimeValue: Int
    $workshopStart: String
    $sportTimeStart: String
  ) {
    updateTechnicalData(
      workshopValue: $workshopValue
      sportTimeValue: $sportTimeValue
      workshopStart: $workshopStart
      sportTimeStart: $sportTimeStart
    ) {
      workshopValue
      sportTimeValue
      workshopStart
      sportTimeStart
    }
  }
`;
