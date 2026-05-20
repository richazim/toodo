export type Post = {
  _id: string,
  userId: string,
  imageUrl: string,
  caption: string,
  postedAt: string,
  createdAt: string,
}

export const posts: Post[] = [
  {
    "_id": "post1",
    "userId": "u1",
    imageUrl: "https://example.com/post1.jpg",
    "caption": "Beautiful view from my trip!",
    "createdAt": "2025-02-01T09:00:00Z"
  },
  {
    "_id": "post2",
    "userId": "u2",
    "imageUrl": "https://example.com/post2.jpg",
    "caption": "My new camera setup.",
    "createdAt": "2025-02-02T14:30:00Z"
  },
  {
    "_id": "post3",
    "userId": "u2",
    "imageUrl": "https://example.com/post3.jpg",
    "caption": "Exploring new places.",
    "createdAt": "2025-02-03T10:15:00Z"
  },
  {
    "_id": "post4",
    "userId": "u3",
    "imageUrl": "https://example.com/post4.jpg",
    "caption": "Traveling with my family.",
    "createdAt": "2025-02-04T16:45:00Z"
  }
]
