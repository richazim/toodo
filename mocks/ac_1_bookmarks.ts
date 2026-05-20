export type Bookmark = {
  "_id": string,
  "userId": string,
  "postId": string,
  "createdAt": string
}

export const bookmarks: Bookmark[] = [
  {
    "_id": "b1",
    "userId": "u1",
    "postId": "post1",
    "createdAt": "2025-02-03T12:00:00Z"
  },
  {
    "_id": "b2",
    "userId": "u2",
    "postId": "post1",
    "createdAt": "2025-02-03T12:30:00Z"
  },
  {
    "_id": "b3",
    "userId": "u3",
    "postId": "post1",
    "createdAt": "2025-02-03T13:00:00Z"
  }
]
