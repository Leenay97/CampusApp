import { gql } from '@apollo/client';

export const UPDATE_TECHNICAL_DATA = gql`
  mutation UpdateTecnhicalData(
    $workshopValue: Int
    $sportTimeValue: Int
    $lessonValue: Int
    $workshopStart: String
    $sportTimeStart: String
    $isRatingShown: Boolean
  ) {
    updateTechnicalData(
      workshopValue: $workshopValue
      sportTimeValue: $sportTimeValue
      lessonValue: $lessonValue
      workshopStart: $workshopStart
      sportTimeStart: $sportTimeStart
      isRatingShown: $isRatingShown
    ) {
      workshopValue
      sportTimeValue
      lessonValue
      workshopStart
      sportTimeStart
      isRatingShown
    }
  }
`;
