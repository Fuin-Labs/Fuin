import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadFiraCode } from "@remotion/google-fonts/FiraCode";

const inter = loadInter("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

const interItalic = loadInter("italic", {
  weights: ["700", "800"],
  subsets: ["latin"],
});

const spaceGrotesk = loadSpaceGrotesk("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

const firaCode = loadFiraCode("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const FONTS = {
  inter: inter.fontFamily,
  interItalic: interItalic.fontFamily,
  spaceGrotesk: spaceGrotesk.fontFamily,
  firaCode: firaCode.fontFamily,
} as const;
