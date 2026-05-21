import { gql } from '@apollo/client';

export const ARCHIVE_SEASON = gql`
  mutation ArchiveSeason($id: ID!) {
    archiveSeason(id: $id) {
      year
      number
    }
  }
`;
