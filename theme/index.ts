import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { appLightColors, appDarkColors } from "./colors";

export const CustomRNPaperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...appLightColors,
  },
};

export const CustomRNPaperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...appDarkColors,
  },
};
