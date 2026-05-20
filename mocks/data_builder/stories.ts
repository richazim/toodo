import { Profile } from "../b_profiles";
import { Story } from "../e_stories";

export interface Stories {
  [key: string]: { // own or others
    [username: string]: {
      user: Profile;
      stories: Story[];
    };
  }
}

// export const storiesWithProfiles: StoryWithProfile[] =  [
//   {
//     "_id": "s1",
//     "userId": "u1",
//     "imageUrl": "https://picsum.photos/200?random=12",
//     "createdAt": "2025-02-10T08:00:00Z",
//     "user": {
//       "_id": "p1",
//       "userId": "u1",
//       "username": "alice",
//       "name": "Alice Martin",
//       "bio": "Love traveling and coding.",
//       "profilePic": "https://i.pravatar.cc/150?img=8"
//     },
//   },
//   {
//     "_id": "s2",
//     "userId": "u2",
//     "imageUrl": "https://example.com/story2.mp4",
//     "createdAt": "2025-02-10T09:00:00Z",
//     "user": {
//       "_id": "p1",
//       "userId": "u1",
//       "username": "alice",
//       "name": "Alice Martin",
//       "bio": "Love traveling and coding.",
//       "profilePic": "https://i.pravatar.cc/150?img=8"
//     },
//   },
//   {
//     "_id": "s2",
//     "userId": "u2",
//     "imageUrl": "https://picsum.photos/200?random=12",
//     "createdAt": "2025-02-10T09:00:00Z",
//     "user": {
//       "_id": "p1",
//       "userId": "u1",
//       "username": "alice",
//       "name": "Alice Martin",
//       "bio": "Love traveling and coding.",
//       "profilePic": "https://i.pravatar.cc/150?img=8"
//     },
//   }
// ]

export const stories: Stories = {
  own: {
    alice: {
      user: {
        "_id": "p1",
        "userId": "u1",
        "username": "alice",
        "name": "Alice Martin",
        "bio": "Love traveling and coding.",
        "profilePic": "https://i.pravatar.cc/150?img=4"
      },
      stories: [
        {
          "_id": "s1",
          "userId": "u1",
          "imageUrl": "https://picsum.photos/400?2",
          "postedAt": "2025-02-10T08:00:00Z",
          "createdAt": "2025-02-10T08:00:00Z"
        },
        {
          "_id": "s2",
          "userId": "u2",
          "imageUrl": "https://picsum.photos/400?2",
          "postedAt": "2025-02-10T09:00:00Z",
          "createdAt": "2025-02-10T09:00:00Z"
        }
      ]
    }
  },

  others: {
    bob: {
      user: {
        "_id": "p2",
        "userId": "u2",
        "username": "bob",
        "name": "Bob Leroy",
        "bio": "Fullstack dev & photography.",
        "profilePic": "https://i.pravatar.cc/150?img=9"
      },
      stories: [
        {
          _id: "s3",
          "userId": "u2",
          imageUrl: "https://picsum.photos/400?2",
          postedAt: "2025-01-01",
          createdAt:  "2025-01-01",
        },
      ],
    },
    sara: {
      user: {
        "_id": "p3",
        "userId": "u3",
        "username": "charlie",
        "name": "Charlie Kim",
        "bio": "Food lover.",
        "profilePic": "https://i.pravatar.cc/150?img=10"
      },
      stories: [
        {
          _id: "s4",
          "userId": "u3",
          imageUrl: "https://picsum.photos/400?3",
          postedAt: "2025-01-01",
          createdAt:  "2025-01-01",
        },
      ],
    },
  },
}