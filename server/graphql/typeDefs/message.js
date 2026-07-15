import { gql } from 'apollo-server-express';

export const messageTypeDefs = gql`
  type Message {
    id: ID!
    authorId: ID!
    author: User!
    text: String!
    type: String!
    groupId: ID!
    createdAt: String!
  }

  extend type Query {
    getMessages(groupId: ID!): [Message]
  }

  extend type Mutation {
    sendMessage(
      authorId: ID!
      text: String!
      groupId: ID!
      isStaffChat: Boolean
      type: String
    ): Message
  }

  extend type Subscription {
    messageSent(groupId: ID!): Message
    staffMessageSent: Message
  }
`;
