import { useQuery } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";


import NewChatItem from "@/screens/Chat/NewChatItem";


type ChatItem = {
  id: number;
  lastMessage: string;
  user: UserMin;
}

type UserMin = {
  id: number;
  username: string;
  name: string;
  profilePic: string;
}

type FollowingFull = {
  following: UserMin;
}

// --------------------------------------------------
// MOCK JSON DATA
// --------------------------------------------------

const mockChats: ChatItem[] = [
  {
    id: 1,
    lastMessage: "Hey, how are you?",
    user: {
      id: 10,
      username: "alice",
      name: "Alice Wonderland",
      profilePic: "https://i.pravatar.cc/100?img=1",
    },
  },
  {
    id: 2,
    lastMessage: "Let's meet tomorrow!",
    user: {
      id: 11,
      username: "bob",
      name: "Bob Builder",
      profilePic: "https://i.pravatar.cc/100?img=2",
    },
  },
];

const mockUserInfo = {
  id: 99,
  username: "az",
  following: [
    {
      following: {
        id: 12,
        username: "charlie",
        name: "Charlie Day",
        profilePic: "https://i.pravatar.cc/100?img=3",
      },
    },
    {
      following: {
        id: 13,
        username: "dora",
        name: "Dora Explorer",
        profilePic: "https://i.pravatar.cc/100?img=4",
      },
    },
  ] as FollowingFull[],
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

type ModalProps = {
  sendMessage: (user: UserMin) => void;
};

const ShareModal: React.FC<ModalProps> = ({ sendMessage }) => {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();

  // Mock: current user (remplace AppContext si nécessaire)
  const { user: currentUser } =  {
    user: { username: "az" },
  };

  // --------------------------------------------------
  // Query 1 — Mock chats list
  // --------------------------------------------------
  const { data: messageList, isLoading } = useQuery({
    queryKey: ["chatList"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 250));
      return mockChats;
    },
  });

  // --------------------------------------------------
  // Query 2 — Mock user info (following list)
  // --------------------------------------------------
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo", currentUser?.username],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return mockUserInfo;
    },
    enabled: !!currentUser?.username,
  });

  // --------------------------------------------------
  // States
  // --------------------------------------------------
  const [chatList, setChatList] = useState<UserMin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserMin[] | null>(null);

  // Merge chats + following
  const getUsersList = (
    chatsList: ChatItem[],
    followingList: FollowingFull[]
  ) => {
    const tempChatsList = chatsList.map((item) => item.user);
    const tempFollowingList = followingList.map((item) => item.following);

    // Suppression des doublons par username
    return [
      ...new Map(
        [...tempChatsList, ...tempFollowingList].map((u) => [u.username, u])
      ).values(),
    ];
  };

  // --------------------------------------------------
  // Generate full chatList
  // --------------------------------------------------
  useEffect(() => {
    if (messageList && userInfo?.following) {
      setChatList(getUsersList(messageList, userInfo.following));
    }
  }, [messageList, userInfo?.following]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  useEffect(() => {
    if (searchTerm.trim().length > 0 && chatList.length > 0) {
      const term = searchTerm.toLowerCase();
      setSearchResults(
        chatList.filter(
          (u) =>
            u.username.toLowerCase().includes(term) ||
            u.name.toLowerCase().includes(term)
        )
      );
    } else {
      setSearchResults(null);
    }
  }, [searchTerm, chatList]);

  // --------------------------------------------------
  // Send message
  // --------------------------------------------------
  const sendNewMessage = (user: UserMin) => {
    sendMessage(user);
  };

  return (
    <View
      style={{
        height,
        backgroundColor: colors.surface,
        paddingVertical: 16,
        justifyContent: "center",
      }}
    >
      {isLoading && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color={colors.onBackground} />
        </View>
      )}

      <FlatList
        ListHeaderComponent={
          <>
            <TextInput
              placeholder="Search"
              placeholderTextColor={"gray"}
              onChangeText={setSearchTerm}
              style={{
                marginHorizontal: 16,
                marginVertical: 16,
                height: 40,
                backgroundColor: "#ddd",
                borderRadius: 6,
                paddingHorizontal: 16,
                color: colors.onBackground,
              }}
            />
            <Divider />
            <Text style={{ marginHorizontal: 16, marginTop: 16 }}>
              Suggested
            </Text>
          </>
        }
        ListEmptyComponent={
          <View
            style={{
              flexDirection: "column",
              marginTop: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>Nothing to see here, yet.</Text>
          </View>
        }
        data={searchResults ?? chatList}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => (
          <NewChatItem item={item} openMessage={sendNewMessage} />
        )}
        keyExtractor={(item) => item.username}
      />
    </View>
  );
};

export default ShareModal;
