import { Composition } from "remotion";
import { Main } from "./Main";
import { FuinPromo } from "./promo/FuinPromo";

import { calculateMetadata } from "./calculate-metadata/calculate-metadata";
import { schema } from "./calculate-metadata/schema";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        defaultProps={{
          steps: null,
          themeColors: null,
          theme: "github-dark" as const,
          codeWidth: null,
          width: {
            type: "auto",
          },
        }}
        fps={30}
        height={1080}
        calculateMetadata={calculateMetadata}
        schema={schema}
      />
      <Composition
        id="FuinPromo"
        component={FuinPromo}
        durationInFrames={868}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
