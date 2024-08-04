export function convertTime(time) {
  const d = new Date(time)
  const now = new Date()
  const timex = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  )
  const diff = Math.floor(
    (timex.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diff < 1) {
    return (
      d.getHours() + ":" + ((d.getMinutes() > 9 ? "" : "0") + d.getMinutes())
    )
  } else if (diff === 1 || diff < 2) {
    return "Yesterday"
  } else {
    return d.toLocaleDateString()
  }
}

export function convertTimeOnly(time) {
  const d = new Date(time).toLocaleTimeString("en-US", {
    hour12: false,
    minute: "2-digit",
  })
  return d.slice(0, -3)
}
