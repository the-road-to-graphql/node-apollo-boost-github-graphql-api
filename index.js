import 'cross-fetch/polyfill';
import ApolloClient, { gql } from 'apollo-boost';

require('dotenv').config();

let state = {
  organization: null,
};

const client = new ApolloClient({
  uri: 'https://api.github.com/graphql',
  request: operation => {
    operation.setContext({
      headers: {
        authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
      },
    });
  },
});

// QUERY

const REPOSITORIES_OF_ORGANIZATION = gql`
  query($organization: String!, $cursor: String) {
    organization(login: $organization) {
      name
      url
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
        after: $cursor
      ) {
        edges {
          node {
            ...repository
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }

  fragment repository on Repository {
    name
    url
  }
`;

client
  .query({
    query: REPOSITORIES_OF_ORGANIZATION,
    variables: {
      organization: 'the-road-to-learn-react',
      cursor: undefined,
    },
  })
  // first page
  .then(result => {
    const { organization } = result.data;
    const { endCursor } = organization.repositories.pageInfo;

    state = {
      organization,
    };

    console.log('first page', state.organization.repositories.edges.length);

    return client.query({
      query: REPOSITORIES_OF_ORGANIZATION,
      variables: {
        organization: 'the-road-to-learn-react',
        cursor: endCursor,
      },
    });
  })
  // second page
  .then(result => {
    const { organization } = result.data;

    state = {
      organization: {
        ...organization,
        repositories: {
          ...organization.repositories,
          edges: [
            ...state.organization.repositories.edges,
            ...organization.repositories.edges,
          ],
        },
      },
    };

    console.log('second page', state.organization.repositories.edges.length);
  });

// MUTATION
