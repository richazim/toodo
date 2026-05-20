export type Like = {
  "_id": string,
  "userId": string,
  "postId": string,
  "createdAt": string
}

export const likes: Like[] = [
  {
    "_id": "l1",
    "postId": "post1",
    "userId": "u1",
    "createdAt": "2025-02-01T10:05:00Z"
  },
  {
    "_id": "l2",
    "postId": "post1",
    "userId": "u2",
    "createdAt": "2025-02-01T12:30:00Z"
  },
  {
    "_id": "l3",
    "postId": "post2",
    "userId": "u3",
    "createdAt": "2025-02-02T14:40:00Z"
  }
]
