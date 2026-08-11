/** GET /api/admin/scenarios — full rows (unlike the public /api/scenarios summary). */
export default defineEventHandler(() => {
  return listScenariosForAdmin()
})
