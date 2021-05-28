import fetchData from './fetch'
import { Node } from './nodes'
import { capitalize, includes } from 'lodash'
import normalize from './normalize'
import authentication from './authentication'

exports.sourceNodes = async (
  { store, actions, cache, reporter, getNode, getNodes },
  {
    apiURL = 'http://localhost:1337',
    contentTypes = [],
    contentTypesDefaultData = {},
    singleTypes = [],
    singleTypesDefaultData = {},
    loginData = {},
    queryLimit = 100,
    isDraftView = false,
    internationalizedTypes = [],
  }
) => {
  const { createNode, deleteNode, touchNode } = actions

  // Authentication function
  const jwtToken = await authentication({ loginData, reporter, apiURL })

  // Start activity, Strapi data fetching
  const fetchActivity = reporter.activityTimer(`Fetched Strapi Data`)
  fetchActivity.start()

  // Generate a list of promises based on the `contentTypes` option.
  const contentTypePromises = contentTypes.map(contentType => {
    const isInternationalized = includes(internationalizedTypes, contentType)
    fetchData({
      apiURL,
      contentType,
      contentTypesDefaultData,
      jwtToken,
      queryLimit,
      isDraftView,
      reporter,
      isInternationalized,
    })
  }
  )

  // Generate a list of promises based on the `singleTypes` option.
  const singleTypePromises = singleTypes.map(singleType => {
    const isInternationalized = includes(internationalizedTypes, singleType) 
    fetchData({
      apiURL,
      singleType,
      singleTypesDefaultData,
      jwtToken,
      queryLimit,
      isDraftView,
      reporter,
      isInternationalized,
    })
  }
  )

  // Execute the promises
  let entities = await Promise.all([...contentTypePromises, ...singleTypePromises])

  // Creating files
  entities = await normalize.downloadMediaFiles({
    entities,
    apiURL,
    store,
    cache,
    createNode,
    touchNode,
    jwtToken,
  })

  // new created nodes
  let newNodes = []

  // Fetch existing strapi nodes
  const existingNodes = getNodes().filter(n => n.internal.owner === `gatsby-source-strapi`)

  // Touch each one of them
  existingNodes.forEach(n => {
    touchNode({ nodeId: n.id })
  })

  // Merge single and content types and retrieve create nodes
  contentTypes.concat(singleTypes).forEach((contentType, i) => {
    const items = entities[i]
    items.forEach(item => {
      const node = Node(capitalize(contentType), item)
      // Adding new created nodes in an Array
      newNodes.push(node)

      // Create nodes
      createNode(node)
    })
  })

  // Make a diff array between existing nodes and new ones
  const diff = existingNodes.filter(({ id: id1 }) => !newNodes.some(({ id: id2 }) => id2 === id1))

  // Delete diff nodes
  diff.forEach(data => {
    deleteNode({ node: getNode(data.id) })
  })

  fetchActivity.end()
}
