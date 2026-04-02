import { gql } from '@apollo/client';

export const UPDATE_TECHNICAL_DATA = gql`
  mutation UpdateTecnhicalData(
    $workshopValue: Int
    $sportTimeValue: Int
    $workshopStart: String
    $sportTimeStart: String
    $isRatingShown: Boolean
  ) {
    updateTechnicalData(
      workshopValue: $workshopValue
      sportTimeValue: $sportTimeValue
      workshopStart: $workshopStart
      sportTimeStart: $sportTimeStart
      isRatingShown: $isRatingShown
    ) {
      workshopValue
      sportTimeValue
      workshopStart
      sportTimeStart
      isRatingShown
    }
  }
`;
