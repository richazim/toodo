export type Comment = {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export const comments: Comment[] = [
  {
    "_id": "c1",
    "userId": "u2",
    "postId": "post1",
    "content": "Wow superbe photo !",
    "createdAt": "2025-02-01T10:00:00Z"
  },
  {
    "_id": "c2",
    "userId": "u3",
    "postId": "post1",
    "content": "Ça donne envie de voyager",
    "createdAt": "2025-02-01T11:00:00Z"
  },
  {
    "_id": "c3",
    "userId": "u1",
    "postId": "post2",
    "content": "Incroyable setup !",
    "createdAt": "2025-02-02T15:00:00Z"
  }
]
