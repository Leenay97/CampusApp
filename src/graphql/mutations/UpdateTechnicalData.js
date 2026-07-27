import { gql } from '@apollo/client';

export const UPDATE_TECHNICAL_DATA = gql`
  mutation UpdateTecnhicalData(
    $workshopValue: Int
    $sportTimeValue: Int
    $lessonValue: Int
    $workshopStart: String
    $workshopEnd: String
    $sportTimeStart: String
    $isRatingShown: Boolean
    $isElectionShown: Boolean
  ) {
    updateTechnicalData(
      workshopValue: $workshopValue
      sportTimeValue: $sportTimeValue
      lessonValue: $lessonValue
      workshopStart: $workshopStart
      workshopEnd: $workshopEnd
      sportTimeStart: $sportTimeStart
      isRatingShown: $isRatingShown
      isElectionShown: $isElectionShown
    ) {
      workshopValue
      sportTimeValue
      lessonValue
      workshopStart
      workshopEnd
      sportTimeStart
      isRatingShown
      isElectionShown
    }
  }
`;
