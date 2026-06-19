import { gql } from 'apollo-server-express';

export const postTypeDefs = gql`
  type Post {
    id: ID!
    title: String!
    text: String!
    createdAt: String!
    author: User
    authorId: ID!
  }

  extend type Query {
    posts: [Post]
  }

  extend type Mutation {
    createPost(title: String!, text: String!, authorId: ID!): Post
    updatePost(id: ID!, title: String, text: String): Post
    deletePost(id: ID!): Post
  }
`;
