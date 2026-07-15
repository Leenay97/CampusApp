import { gql } from '@apollo/client';

export const GET_TEACHER_REGISTRATION_TOKEN = gql`
  query GetTeacherRegistrationToken {
    teacherRegistrationToken
  }
`;
