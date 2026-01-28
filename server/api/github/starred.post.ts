import type { Repository, GithubStarredRequest, GithubStarredResponse } from '~/types'

interface GitHubAPIResponse {
  data: any[]
  headers: Record<string, string>
}

/**
 * Fetch data from GitHub API
 */
async function fetchGithubData(url: string, token: string): Promise<GitHubAPIResponse> {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  const linkHeader = response.headers.get('link') || ''
  
  return {
    data,
    headers: {
      link: linkHeader
    }
  }
}

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
 * Fetch all starred repositories for a user with pagination
 */
async function fetchStarredRepos(username: string, token: string): Promise<Repository[]> {
  let nextPageUrl = `https://api.github.com/users/${username}/starred`
  const allRepos: Repository[] = []

  while (nextPageUrl) {
    const { data, headers } = await fetchGithubData(nextPageUrl, token)

    if (!data.length) break

    const repos: Repository[] = data.map((repo: any) => ({
      name: repo.name,
      description: repo.description || 'No description provided.',
      html_url: repo.html_url,
      language: repo.language || 'Unknown',
      stargazers_count: formatStarCount(repo.stargazers_count),
      created_at: repo.created_at,
    }))

    allRepos.push(...repos)

    // Get next page URL from link header
    nextPageUrl = getNextPageUrl(headers.link)
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
    console.error('Error fetching starred repos:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch starred repositories'
    })
  }
})
