import React, { useState, useRef, useEffect } from "react";
import { View, Button, StyleSheet, TouchableOpacity, Text } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Canvas, Path } from "@shopify/react-native-skia";
import ColorPicker from "react-native-wheel-color-picker";

interface IPath {
  segments: string[];
  color?: string;
}


interface AppButtonProps {
  title: string,
  onPress: () => void
  children?: React.ReactNode
}

const AppButton = (props: AppButtonProps): JSX.Element => (
  <TouchableOpacity onPress={props.onPress} style={[styles.btn, props.children ? styles.colorBtnWithChildren : {}]}>
    {props.children && props.children}
    <Text style={styles.btnText}>{props.title}</Text>
  </TouchableOpacity>
)

export default function Draw() {
  const [paths, setPaths] = useState<IPath[]>([]);
  const [replayIndex, setReplayIndex] = useState(0); // Index of the path being replayed
  const [currentSegment, setCurrentSegment] = useState(0); // Current segment of the current path
  const [isReplaying, setIsReplaying] = useState(false); // To start/stop replay
  const animationRef = useRef<number | null>(null); // To hold requestAnimationFrame ID
  const [penColor, setPenColor] = useState<string>('#000000')
  const [colorPickerVisible, setColorPickerVisible] = useState<boolean>(false)

  const onColorChange = (color: string) => {
    setPenColor(color)
  };
  
  const pan = Gesture.Pan()
    .onStart((g) => {      
      const newPath: IPath = {
        segments: [`M ${g.x} ${g.y}`],
        color: penColor,
      };
      setPaths((prevPaths) => [...prevPaths, newPath]);
    })
    .onUpdate((g) => {
      setPaths((prevPaths) => {
        if (prevPaths.length === 0) return prevPaths;
        const updatedPaths = [...prevPaths];
        const lastPathIndex = updatedPaths.length - 1;
        if (updatedPaths[lastPathIndex]?.segments) {
          updatedPaths[lastPathIndex].segments.push(`L ${g.x} ${g.y}`);
        }
        return updatedPaths;
      });
    })
    .minDistance(0);

  // Function to handle the replay animation
  const startReplay = () => {
    if (isReplaying) return; // Prevent multiple replays at once

    setIsReplaying(true);
    setReplayIndex(0); // Reset to the first path
    setCurrentSegment(0); // Start with the first segment of the first path

    if (animationRef.current) cancelAnimationFrame(animationRef.current); // Cancel any ongoing animation
    animationRef.current = requestAnimationFrame(replayStep);
  };

  // Replay step-by-step animation
  const replayStep = () => {
    setCurrentSegment((prevSegment) => {
      const currentPath = paths[replayIndex];
      if (!currentPath) return 0; // Stop if there are no paths

      const nextSegment = prevSegment + 1;

      if (nextSegment >= currentPath.segments.length) {
        // If we reached the end of the current path
        if (replayIndex < paths.length - 1) {
          // Move to the next path
          setReplayIndex((prevIndex) => prevIndex + 1);
          setCurrentSegment(0); // Start from the beginning of the next path
          animationRef.current = requestAnimationFrame(replayStep); // Continue replay
        } else {
          // All paths have been replayed
          setIsReplaying(false);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }
        return prevSegment;
      } else {
        // Continue with the current path
        animationRef.current = requestAnimationFrame(replayStep);
      }

      return nextSegment;
    });
  };

  // Clear all paths
  const clearPaths = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current); // Stop any ongoing animation
    setPaths([]);
    setReplayIndex(0);
    setCurrentSegment(0);
    setIsReplaying(false);
  };

  useEffect(() => {
    // Clean up the animation frame on unmount
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const toggleColorPicker = (): void => setColorPickerVisible(prevState => !prevState)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.toolbar}>        
      <AppButton title="Color" onPress={() => toggleColorPicker()}>
            <View style={[styles.colorPreviewCircle, { backgroundColor: penColor}]} />
          </AppButton>
        <View style={{flexDirection: 'row', gap: 8}}>
          <AppButton title="Clear" onPress={clearPaths} />
          <AppButton title="Replay" onPress={startReplay} />          
        </View>        
      </View>
      <View style={{flex: 1, gap: 12}}>
        <View style={{flex: 1}}>
          <GestureDetector gesture={pan}>
            <View style={{ flex: 1, backgroundColor: "#FCF3E1", borderRadius: 20 }}>              
              {/* Original Canvas for Drawing */}
              <Canvas style={{ flex: 1 }}>
                {paths.map((p, index) => (
                  <Path
                    key={index}
                    path={p.segments.join(" ")}
                    strokeWidth={20}
                    style="stroke"
                    color={p.color}
                    strokeCap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </Canvas>
            </View>
          </GestureDetector>
        </View>

        {/* Replay Canvas */}
        <View style={{flex: 1, backgroundColor: '#E3FFDE', borderRadius: 20}}>
          <Text style={styles.previewText}>Preview</Text>
          <Canvas style={{ flex: 1}}>
            {paths.slice(0, replayIndex + 1).map((p, index) => (
              <Path
                key={index}
                path={p.segments.slice(0, index === replayIndex ? currentSegment : p.segments.length).join(" ")}
                strokeWidth={20}
                style="stroke"
                color={p.color}
                strokeCap="round"
                strokeLinejoin="round"
              />
            ))}
          </Canvas>
        </View>
      </View>
      {colorPickerVisible && (
        <View style={styles.colorPickerModal}>
          <View style={{marginBottom: 15}}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => toggleColorPicker()}><Text style={{fontSize: 25}}>{'\u00D7'}</Text></TouchableOpacity>
            <ColorPicker            
              color={penColor}
              onColorChange={(color) => onColorChange(color)}
              // onColorChangeComplete={(color) => alert(`Color selected: ${color}`)}
              thumbSize={30}
              sliderSize={30}
              noSnap={true}
              row={false}
            />
          </View>
          <AppButton title="Done" onPress={() => toggleColorPicker()} />          
        </View>        
      )}
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',    
  },
  btnText: {
    color: '#0068F0',
  },
  colorPickerModal: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9999999,
    width: '40%',
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 15,    
  },
  modalCloseBtn: {
    position: 'absolute',
    right: -20,
    top: -20,    
    padding: 10,
  },
  colorBtnWithChildren: {
    flexDirection: 'row',
    gap: 5,
  },
  colorPreviewCircle: {
    width: 24,
    height: 24,
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 12,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  previewText: {
    opacity: 0.3,
    padding: 15,
    fontWeight: '500',
    textTransform: 'uppercase',
  }
})