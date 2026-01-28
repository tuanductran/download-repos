import type { Repository, GithubStarredRequest, GithubStarredResponse } from '~/types'

/**
 * Format star count for display
 */
function formatStarCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}+`
}

/**
 * Parse link header to get next page URL
 */
function getNextPageUrl(linkHeader: string): string {
  if (!linkHeader) return ''
  
  const links = linkHeader.split(',')
  const nextLink = links.find(link => link.includes('rel="next"'))
  
  if (!nextLink) return ''
  
  const match = nextLink.match(/<([^>]+)>/)
  return match ? match[1] : ''
}

/**
 * Check rate limit from response headers
 */
function checkRateLimit(headers: Headers): { remaining: number; resetTime: Date } {
  const remaining = parseInt(headers.get('x-ratelimit-remaining') || '5000', 10)
  const resetTimestamp = parseInt(headers.get('x-ratelimit-reset') || '0', 10)
  const resetTime = new Date(resetTimestamp * 1000)
  
  return { remaining, resetTime }
}

/**
 * Fetch all starred repositories for a user with pagination
 */
async function fetchStarredRepos(username: string, token: string): Promise<Repository[]> {
  let nextPageUrl = `https://api.github.com/users/${username}/starred`
  const allRepos: Repository[] = []
  let pageCount = 0

  while (nextPageUrl) {
    pageCount++
    const response = await fetch(nextPageUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    // Check rate limit
    const rateLimit = checkRateLimit(response.headers)
    if (rateLimit.remaining < 10) {
      console.warn(`Low rate limit: ${rateLimit.remaining} requests remaining. Resets at ${rateLimit.resetTime}`)
    }

    const data = await response.json()

    if (!data.length) break

    const repos: Repository[] = data.map((repo: any) => ({
      name: repo.name,
      description: repo.description || 'No description provided.',
      html_url: repo.html_url,
      language: repo.language || 'Unknown',
      stargazers_count: repo.stargazers_count,
      stargazers_count_formatted: formatStarCount(repo.stargazers_count),
      created_at: repo.created_at,
    }))

    allRepos.push(...repos)

    // Get next page URL from link header
    const linkHeader = response.headers.get('link') || ''
    nextPageUrl = getNextPageUrl(linkHeader)
  }

  return allRepos
}

/**
 * Server API endpoint to fetch starred repositories
 */
export default defineEventHandler(async (event): Promise<GithubStarredResponse> => {
  try {
    const body = await readBody<GithubStarredRequest>(event)

    if (!body.username || !body.token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username and token are required'
      })
    }

    const repositories = await fetchStarredRepos(body.username, body.token)

    return {
      repositories
    }
  } catch (error: any) {
    // Sanitize error - don't log the token
    const sanitizedError = error.message || 'Unknown error occurred'
    console.error('Error fetching starred repos:', sanitizedError)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch starred repositories'
    })
  }
})
