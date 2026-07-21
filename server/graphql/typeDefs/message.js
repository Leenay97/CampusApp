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
    replyToId: ID
    replyTo: Message
    reactions: [ReactionCount!]!
    myReaction: String
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
      replyToId: ID
    ): Message
    setMessageReaction(messageId: ID!, emoji: String!): Message
  }

  extend type Subscription {
    messageSent(groupId: ID!): Message
    staffMessageSent: Message
  }
`;
