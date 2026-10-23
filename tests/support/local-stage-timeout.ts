// Keep repository/CI budgets unchanged; local execution may opt into a longer
// wall-clock budget without changing assertions, route coverage or thresholds.
export function localStageTimeout(baseline: number) {
  const value = process.env.PURITY_LOCAL_STAGE_TIMEOUT_MS
  if (!value) return baseline
  if (
    process.env.EMAIL_MODE !== "offline" ||
    process.env.PAYMENT_MODE !== "test" ||
    process.env.VERCEL_ENV ||
    !/^http:\/\/(127\.0\.0\.1|localhost):3102$/.test(
      process.env.PLAYWRIGHT_BASE_URL ?? ""
    )
  ) {
    throw new Error(
      "Stage deadline overrides require isolated offline loopback execution"
    )
  }
  const deadline = Number(value)
  if (
    !Number.isInteger(deadline) ||
    deadline < baseline ||
    deadline > 1_200_000
  ) {
    throw new Error(
      "Local stage deadline must retain the baseline and remain bounded"
    )
  }
  return deadline
}
