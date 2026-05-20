export type Profile = {
  _id: string,
  userId: string,
  username: string,
  name: string,
  profilePic: string,
  bio: string,
}

export const profiles: Profile[] = [
  {
    "_id": "p1",
    "userId": "u1",
    "username": "alice",
    "name": "Alice Martin",
    "bio": "Love traveling and coding.",
    "profilePic": "https://i.pravatar.cc/150?img=4"
  },
  {
    "_id": "p2",
    "userId": "u2",
    "username": "bob",
    "name": "Bob Leroy",
    "bio": "Fullstack dev & photography.",
    "profilePic": "https://i.pravatar.cc/150?img=8"
  },
  {
    "_id": "p3",
    "userId": "u3",
    "username": "charlie",
    "name": "Charlie Kim",
    "bio": "Food lover.",
    "profilePic": "https://i.pravatar.cc/150?img=9"
  }
]
