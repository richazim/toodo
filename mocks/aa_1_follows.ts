export type Follow = {
  "_id": string,
  "followerId": string,
  "followingId": string,
  "createdAt": string
}

export const follows: Follow[] = [
  {
    "_id": "f1",
    "followerId": "u1",
    "followingId": "u2",
    "createdAt": "2025-01-15T09:00:00Z"
  },
  {
    "_id": "f2",
    "followerId": "u2",
    "followingId": "u1",
    "createdAt": "2025-01-15T09:10:00Z"
  },
  {
    "_id": "f3",
    "followerId": "u1",
    "followingId": "u3",
    "createdAt": "2025-01-20T17:00:00Z"
  }
]
