export type StoryView = {
  "_id": string,
  "storyId": string,
  "viewerId": string,
  "viewedAt": string
}

export const story_views: StoryView[] = [
  {
    "_id": "sv1",
    "storyId": "s1",
    "viewerId": "u2",
    "viewedAt": "2025-02-10T08:10:00Z"
  },
  {
    "_id": "sv2",
    "storyId": "s1",
    "viewerId": "u3",
    "viewedAt": "2025-02-10T08:20:00Z"
  },
  {
    "_id": "sv3",
    "storyId": "s2",
    "viewerId": "u1",
    "viewedAt": "2025-02-10T09:30:00Z"
  }
]
