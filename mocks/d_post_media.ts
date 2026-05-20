export type PostMedia = {
  _id: string;
  postId: string;
  mediaType: "image" | "video";
  mediaUrl: string;
}

export const postMedia: PostMedia[] = [
  {
    "_id": "m1",
    "postId": "post1",
    "mediaUrl": "https://example.com/media/travel1.jpg",
    "mediaType": "image"
  },
  {
    "_id": "m2",
    "postId": "post1",
    "mediaUrl": "https://example.com/media/travel2.jpg",
    "mediaType": "image"
  },
  {
    "_id": "m3",
    "postId": "post2",
    "mediaUrl": "https://example.com/media/camera_setup.mp4",
    "mediaType": "video"
  }
]
