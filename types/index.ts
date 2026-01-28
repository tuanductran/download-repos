export interface Repository {
  name: string
  description: string
  html_url: string
  language: string
  stargazers_count: number
  stargazers_count_formatted: string
  created_at: string
}

export interface GithubStarredRequest {
  username: string
  token: string
}

export interface GithubStarredResponse {
  repositories: Repository[]
  error?: string
}
