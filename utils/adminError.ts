/** Pulls the server's `createError({ statusMessage })` text back out of a failed $fetch call. */
export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string; message?: string } }).data
    if (data?.statusMessage) return data.statusMessage
    if (data?.message) return data.message
  }
  return '保存に失敗しました。もう一度お試しください。'
}
