import React, { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors } from "../lib/theme";

const { width } = Dimensions.get("window");
const FRAME = width - 48;

// Scan-line loading animation shown over the captured photo while the
// vision model + USDA lookup run — see Phase 0 research: a scanning
// animation specific to "analyzing food" reads far more premium than a
// generic spinner.
export default function ScanningOverlay({ label }: { label: string }) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(FRAME - 4, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 60,
      }}
    >
      <View
        style={{
          width: FRAME,
          height: FRAME,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: colors.accent,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOpacity: 0.8,
              shadowRadius: 8,
            },
            lineStyle,
          ]}
        />
      </View>
      <Text className="text-text font-semibold text-base mt-5">{label}</Text>
    </View>
  );
}
