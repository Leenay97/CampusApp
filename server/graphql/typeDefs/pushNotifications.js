import { gql } from 'apollo-server-express';

export const pushTypeDefs = gql`
  extend type Mutation {
    sendPushToStaff(title: String!, body: String!, url: String): Boolean!
    sendPushToGroup(groupId: ID!, title: String!, body: String!, url: String): Boolean!
    sendPushToUser(userId: ID!, title: String!, body: String!, url: String): Boolean!
    sendPushToAll(title: String!, body: String!, url: String): Boolean!
  }
`;
