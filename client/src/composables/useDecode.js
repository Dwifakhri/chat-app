export function decodeString(str) {
  const string = str?.split(" ")
  const initial = string?.map((data) => data[0])?.join("")
  return initial
}
