export type User = {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}


export const users: User[] = [
  {
    "_id": "u1",
    "email": "alice@example.com",
    "passwordHash": "hashed_pw_1",
    "createdAt": "2025-01-01T10:00:00Z"
  },
  {
    "_id": "u2",
    "email": "bob@example.com",
    "passwordHash": "hashed_pw_2",
    "createdAt": "2025-01-02T11:00:00Z"
  },
  {
    "_id": "u3",
    "email": "charlie@example.com",
    "passwordHash": "hashed_pw_3",
    "createdAt": "2025-01-03T12:00:00Z"
  }
]

