# gatsby-source-strapi

Source plugin for pulling documents into Gatsby from a Strapi API.

## Install

`npm install --save gatsby-source-strapi`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-strapi`,
    options: {
      apiURL: `http://localhost:1337`,
      queryLimit: 1000, // Default to 100
      isDraftView: true, // if you want to crawl including draft docs. set true (default: false)
      contentTypes: [`article`, `user`],
      //default data for content type, if response is 404
      contentTypesDefaultData: {
        `article`:{
          //default data
        }
      },
      //If using single types place them in this array.
      singleTypes: [`home-page`, `contact`],
      //default data for single content type, if response is 404
      singleTypesDefaultData: {
        `home-page`:{
          //default data
        }
      },
      // Possibility to login with a strapi user, when content types are not publically available (optional).
      loginData: {
        identifier: "",
        password: "",
      },
    },
  },
]
```

## How to query

You can query Document nodes created from your Strapi API like the following:

```graphql
{
  allStrapiArticle {
    edges {
      node {
        id
        title
        content
      }
    }
  }
}
```

To query images you can do the following:

```graphql
{
  allStrapiArticle {
    edges {
      node {
        id
        singleImage {
          publicURL
        }
        multipleImages {
          localFile {
            publicURL
          }
        }
      }
    }
  }
}
```
