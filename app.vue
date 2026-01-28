<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <UContainer class="py-8">
      <div class="space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
            Download Your Starred GitHub Repositories
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Enter your GitHub credentials to fetch and export your starred repositories
          </p>
        </div>

        <!-- Input Form -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">GitHub Credentials</h2>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub Username <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="username"
                placeholder="Enter your GitHub username"
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub Personal Access Token <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="token"
                type="password"
                placeholder="Enter your GitHub token"
                :disabled="loading"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Your token is sent securely to the server but never stored. Keep it confidential.
              </p>
            </div>

            <div class="flex gap-3">
              <UButton
                @click="fetchRepositories"
                :loading="loading"
                :disabled="!username || !token"
                size="lg"
              >
                Fetch Repositories
              </UButton>

              <UButton
                v-if="repositories.length > 0"
                @click="exportToCsv"
                color="green"
                variant="outline"
                size="lg"
              >
                ⬇️ Export to CSV
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Results Section -->
        <div v-if="repositories.length > 0">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">
                  Starred Repositories ({{ repositories.length }})
                </h2>
              </div>
            </template>

            <UTable
              :rows="repositories"
              :columns="columns"
              :loading="loading"
            >
              <template #name-data="{ row }">
                <ULink
                  :to="row.html_url"
                  target="_blank"
                  class="font-medium text-primary"
                >
                  {{ row.name }}
                </ULink>
              </template>

              <template #description-data="{ row }">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ row.description }}
                </span>
              </template>

              <template #language-data="{ row }">
                <UBadge v-if="row.language !== 'Unknown'" color="blue" variant="soft">
                  {{ row.language }}
                </UBadge>
                <span v-else class="text-gray-400 text-sm">Unknown</span>
              </template>

              <template #stargazers_count-data="{ row }">
                <div class="flex items-center gap-1">
                  <span class="text-yellow-500">⭐</span>
                  <span>{{ row.stargazers_count_formatted }}</span>
                </div>
              </template>

              <template #created_at-data="{ row }">
                <span class="text-sm">
                  {{ formatDate(row.created_at) }}
                </span>
              </template>
            </UTable>
          </UCard>
        </div>

        <!-- Empty State -->
        <UCard v-else-if="!loading">
          <div class="text-center py-12">
            <div class="text-6xl mb-4">⭐</div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No repositories yet
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Enter your credentials above to fetch your starred repositories
            </p>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { Repository } from '~/types'
import { useCsvExport } from '~/composables/useCsvExport'

const toast = useToast()
const { exportToCSV } = useCsvExport()

// Form state
const username = ref('')
const token = ref('')
const loading = ref(false)
const repositories = ref<Repository[]>([])

// Table columns configuration
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'language', label: 'Language' },
  { key: 'stargazers_count', label: 'Stars' },
  { key: 'created_at', label: 'Created At' }
]

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Fetch starred repositories from server API
 */
const fetchRepositories = async () => {
  if (!username.value || !token.value) {
    toast.add({
      title: 'Missing Credentials',
      description: 'Please enter both username and token',
      color: 'red'
    })
    return
  }

  loading.value = true
  repositories.value = []

  try {
    const response = await $fetch('/api/github/starred', {
      method: 'POST',
      body: {
        username: username.value,
        token: token.value
      }
    })

    repositories.value = response.repositories

    toast.add({
      title: 'Success',
      description: `Fetched ${repositories.value.length} repositories`,
      color: 'green'
    })
  } catch (error: any) {
    console.error('Error fetching repositories:', error)
    
    // Improved error message extraction
    let errorMessage = 'Failed to fetch repositories'
    if (error.data?.statusMessage) {
      errorMessage = error.data.statusMessage
    } else if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Export repositories to CSV
 */
const exportToCsv = () => {
  try {
    exportToCSV(repositories.value)
    
    toast.add({
      title: 'Export Successful',
      description: 'CSV file has been downloaded',
      color: 'green'
    })
  } catch (error: any) {
    toast.add({
      title: 'Export Failed',
      description: error.message || 'Failed to export to CSV',
      color: 'red'
    })
  }
}
</script>
