import { Profile } from "../b_profiles";
import { Post } from "../c_posts";

//////////////////////////////////////
export interface PostWithProfile extends Post {
  user: Profile
}

export const postsWithProfiles: PostWithProfile[] = [
  {
    "_id": "post1",
    "userId": "u1",
    "imageUrl": "https://picsum.photos/200?random=12",
    "caption": "Beautiful view from my trip!",
    "postedAt": new Date().toISOString(),
    "createdAt": "2025-02-01T09:00:00Z",
    user: {
      "_id": "p1",
      "userId": "u1",
      "username": "alice",
      "name": "Alice Martin",
      "bio": "Love traveling and coding.",
      "profilePic": "https://i.pravatar.cc/150?img=8"
    },
  },
  {
    "_id": "post2",
    "userId": "u2",
    "imageUrl": "https://picsum.photos/200?random=12",
    "caption": "My new camera setup.",
    "postedAt": new Date().toISOString(),
    "createdAt": "2025-02-02T14:30:00Z",
    "user": {
      "_id": "p1",
      "userId": "u1",
      "username": "alice",
      "name": "Alice Martin",
      "bio": "Love traveling and coding.",
      "profilePic": "https://i.pravatar.cc/150?img=8"
    },
  },
  {
    "_id": "post3",
    "userId": "u2",
    "imageUrl": "https://picsum.photos/200?random=12",
    "caption": "Exploring new places.",
    "postedAt": new Date().toISOString(),
    "createdAt": "2025-02-03T10:15:00Z",
    "user": {
      "_id": "p1",
      "userId": "u1",
      "username": "alice",
      "name": "Alice Martin",
      "bio": "Love traveling and coding.",
      "profilePic": "https://example.com/avatar1.jpg"
    },
  },
  {
    "_id": "post4",
    "userId": "u3",
    "imageUrl": "https://picsum.photos/200?random=12",
    "caption": "Traveling with my family.",
    "postedAt": new Date().toISOString(),
    "createdAt": "2025-02-04T16:45:00Z",
    "user": {
      "_id": "p1",
      "userId": "u1",
      "username": "alice",
      "name": "Alice Martin",
      "bio": "Love traveling and coding.",
      "profilePic": "https://i.pravatar.cc/150?img=8"
    },
  }
]

//////////////////////////////////////