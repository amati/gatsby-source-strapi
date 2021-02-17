import axios from 'axios'
import { isObject, startsWith, endsWith, forEach, set, castArray } from 'lodash'
import pluralize from 'pluralize'

module.exports = async ({
  apiURL,
  contentType,
  contentTypesDefaultData,
  singleType,
  singleTypesDefaultData,
  jwtToken,
  queryLimit,
  isDraftView,
  reporter,
}) => {
  // Define API endpoint.
  let apiBase = singleType ? `${apiURL}/${singleType}` : `${apiURL}/${pluralize(contentType)}`

  let apiEndpoint = `${apiBase}?_limit=${queryLimit}`
  if (isDraftView) {
    apiEndpoint += `&_publicationState=preview`
  }

  // reporter.info(`Starting to fetch data from Strapi - ${apiEndpoint}`)
  reporter.info('Starting to fetch - ' + apiEndpoint)
  // console.log(apiEndpoint)

  try {
    const { data } = await axios(apiEndpoint, addAuthorizationHeader({}, jwtToken))
    return castArray(data).map(clean)
  } catch (error) {
    let defaultData = singleType ? singleTypesDefaultData[singleType] : contentTypesDefaultData[pluralize(contentType)]
    let isDefaultData = Object.keys(defaultData).length !== 0

    if (error.response.status === 404 && isDefaultData) {
      reporter.info(`Use Default Data for singleType - ${singleType}`)
      return castArray(defaultData).map(clean)
    } else {
      reporter.panic(`Failed to fetch data from Strapi`, error)
    }
  }
}

/**
 * Remove fields starting with `_` symbol.
 *
 * @param {object} item - Entry needing clean
 * @returns {object} output - Object cleaned
 */
const clean = item => {
  forEach(item, (value, key) => {
    if (endsWith(key, `component`)) {
      item.component = item[key]
      delete item[key]
    } else if (startsWith(key, `__`)) {
      delete item[key]
    } else if (startsWith(key, `_`)) {
      delete item[key]
      item[key.slice(1)] = value
    } else if (isObject(value)) {
      item[key] = clean(value)
    }
  })

  return item
}

const addAuthorizationHeader = (options, token) => {
  if (token) {
    set(options, 'headers.Authorization', `Bearer ${token}`)
  }

  return options
}
