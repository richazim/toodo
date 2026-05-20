import React, { useCallback, useMemo, useRef } from "react";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { ToastAndroid, useWindowDimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import ShareModal from "./PostShare";
import { sharePostBottomSheetRef, useSharePostBottomSheet } from "@/hooks/modals/useSharePostBottomSheet";

type UserMin = {
  id: number;
  username: string;
  name: string;
  profilePic: string;
};

/* ------------------------------------------
   🔥 MOCK JSON – remplace TOUTES les données BD
------------------------------------------- */

const MOCK_POST_SHARE = {
  type: "POST",
  postId: 55,
  storyId: null,
};

const MOCK_USERS: UserMin[] = [
  { id: 1, username: "emma_dev", name: "Emma", profilePic: "https://i.pravatar.cc/100?img=1" },
  { id: 2, username: "johnny", name: "John", profilePic: "https://i.pravatar.cc/100?img=2" },
  { id: 3, username: "sara", name: "Sara", profilePic: "https://i.pravatar.cc/100?img=3" },
];

export default function PostShareMenu() {
  const router = useRouter();
  const modalData = MOCK_POST_SHARE; // force les données mockées

  const { closeSharePostBottomSheet, getPostUsername } = useSharePostBottomSheet();

  const { height } = useWindowDimensions();
  const snapPoints = useMemo(() => [height / 2, height], [height]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        closeSharePostBottomSheet();
      };
    },
    [router]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const onClose = () => {
    closeSharePostBottomSheet();
  };

  /* ----------------------------------------------------------
     🔥 Envoi MOCK → remplace entièrement newMessage() + backend
  ----------------------------------------------------------- */
  const sendPost = async (user: UserMin) => {
    if (!modalData) return;

    if (modalData.type === "POST") {
      console.log("MOCK: share POST", {
        postId: modalData.postId,
        to: user.username,
      });

      ToastAndroid.show("Mock POST shared!", ToastAndroid.SHORT);
    } else if (modalData.type === "STORY") {
      console.log("MOCK: share STORY", {
        storyId: modalData.storyId,
        to: user.username,
      });

      ToastAndroid.show("Mock STORY shared!", ToastAndroid.SHORT);
    }

    onClose();
  };

  const renderMenuModal = () => (
    <ShareModal
      sendMessage={sendPost}
      // 🔥 passe des utilisateurs mockés si ton composant en a besoin
      // mockUsers={MOCK_USERS}
    />
  );

  const { colors } = useTheme();

  return (
    <BottomSheet
      handleIndicatorStyle={{ backgroundColor: "#dadada" }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      snapPoints={snapPoints}
      ref={sharePostBottomSheetRef}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      index={-1}
      onChange={handleSheetChanges}
    >
      <BottomSheetView>
        {renderMenuModal()}
      </BottomSheetView>
    </BottomSheet>
  );
}
