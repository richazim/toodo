export type Notification = {
  "_id": string,
  "userId": string,
  "type": "like" | "comment" | "follow",
  "payload": { "postId"?: string, "from": string, "commentId"?: string },
  "createdAt": string
}

export const notifications: Notification[] = [
  {
    "_id": "n1",
    "userId": "u1",
    "type": "like",
    "payload": { "postId": "post2", "from": "u2" },
    "createdAt": "2025-02-02T14:45:00Z"
  },
  {
    "_id": "n2",
    "userId": "u2",
    "type": "comment",
    "payload": { "postId": "post1", "from": "u3", "commentId": "c2" },
    "createdAt": "2025-02-01T11:02:00Z"
  },
  {
    "_id": "n3",
    "userId": "u3",
    "type": "follow",
    "payload": { "from": "u1" },
    "createdAt": "2025-01-15T09:10:00Z"
  }
]
