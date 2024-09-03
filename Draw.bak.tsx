import React, { useState } from "react";
import { View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Canvas, Path } from "@shopify/react-native-skia";

interface IPath {
  segments: String[];
  color?: string;
}

export default function Draw() {
  const [paths, setPaths] = useState<IPath[]>([]);

  console.log("paths = ", paths)

  const pan = Gesture.Pan()
    .onStart((g) => {
      console.log("START -------------")
      const newPaths = [...paths];
      newPaths[paths.length] = {
        segments: [],
        color: "#06d6a0",
      };
      newPaths[paths.length].segments.push(`M ${g.x} ${g.y}`);
      setPaths(newPaths);
    })
    .onUpdate((g) => {
      console.log("UPDATE -------------")
      const index = paths.length - 1;
      const newPaths = [...paths];
      if (newPaths?.[index]?.segments) {
        newPaths[index].segments.push(`L ${g.x} ${g.y}`);
        setPaths(newPaths);
      }
    })
    .minDistance(1);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={pan}>
        <View style={{ flex: 1, backgroundColor: "#FCF3E1", borderRadius: 20 }}>
          <Canvas style={{ flex: 1 }}>
            {paths.map((p, index) => {
              console.log("p =", p)
              return (
              <Path
                key={index}
                path={p.segments.join(" ")}
                strokeWidth={20}
                style="stroke"
                color={p.color}
                strokeCap={"round"}
                stroke-linejoin="round"
              />

            )})}
          </Canvas>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}