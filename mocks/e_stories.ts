export type Story = {
  "_id": string;
  "userId": string;
  "imageUrl": string;
  "postedAt": string;
  "createdAt": string;
}

export const stories: Story[] = [
  {
    "_id": "s1",
    "userId": "u1",
    "imageUrl": "https://example.com/story1.jpg",
    "postedAt": "2025-02-10T08:00:00Z",
    "createdAt": "2025-02-10T08:00:00Z"
  },
  {
    "_id": "s2",
    "userId": "u2",
    "imageUrl": "https://example.com/story2.mp4",
    "postedAt": "2025-02-10T09:00:00Z",
    "createdAt": "2025-02-10T09:00:00Z"
  }
]
