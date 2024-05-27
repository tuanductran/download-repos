const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const os = require('os')
require('dotenv').config()

const { GITHUB_TOKEN, GITHUB_USERNAME, GITHUB_LAST_PAGE } = process.env
const FILE_PREFIX = 'starred-repos'
const PAGE = 1
const SLEEP_TIME = 5000 // milliseconds
const RATE_LIMIT_THRESHOLD = 10 // The remaining number of requests before a long break

const jsonDir = path.join(os.tmpdir(), 'json')

if (!fs.existsSync(jsonDir)) {
  fs.mkdirSync(jsonDir, { recursive: true })
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const checkRateLimit = async () => {
  const limitInfo = JSON.parse(execSync(`curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/rate_limit"`).toString())
  const { remaining, reset } = limitInfo.rate

  if (remaining < RATE_LIMIT_THRESHOLD) {
    const waitTime = (reset * 1000) - Date.now()
    console.warn(`Rate limit is ${remaining}. Waiting for ${waitTime / 1000} seconds until reset.`)
    await sleep(waitTime)
  }
}

const apiRequest = async page => {
  try {
    const repos = JSON.parse(execSync(`curl -s -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "https://api.github.com/users/${GITHUB_USERNAME}/starred?per_page=100&page=${page}"`).toString())

    if (repos.message) {
      throw new Error(repos.message)
    }

    return repos.length > 0 ? repos : null
  } catch (error) {
    console.error(`An error occurred: ${error.message}. Exiting...`)
    return null
  }
}

const downloadJson = async () => {
  for (let page = PAGE; page <= GITHUB_LAST_PAGE; page++) {
    await checkRateLimit()

    console.log(`Retrieving data from page ${page}...`)
    const repos = await apiRequest(page)

    if (!repos) {
      console.log('No more data to retrieve or an error occurred. Ending data retrieval process.')
      break
    }

    const jsonFile = path.resolve(jsonDir, `${FILE_PREFIX}-page-${page}.json`)
    fs.writeFileSync(jsonFile, JSON.stringify(repos, null, 2))

    await sleep(SLEEP_TIME)
  }
}

downloadJson()