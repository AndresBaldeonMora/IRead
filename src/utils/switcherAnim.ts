import { Animated } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

export const switcherY = new Animated.Value(0); // 0 = visible, -80 = hidden

let lastScrollY = 0;
let targetHidden = false;

export function handleSwitcherScroll(
  e: NativeSyntheticEvent<NativeScrollEvent>
) {
  const y = e.nativeEvent.contentOffset.y;
  const diff = y - lastScrollY;
  lastScrollY = y;

  if (diff > 4 && y > 40 && !targetHidden) {
    targetHidden = true;
    Animated.spring(switcherY, {
      toValue: -80,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  } else if (diff < -4 && targetHidden) {
    targetHidden = false;
    Animated.spring(switcherY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  }
}

export function showSwitcher() {
  lastScrollY = 0;
  targetHidden = false;
  Animated.spring(switcherY, {
    toValue: 0,
    useNativeDriver: true,
    speed: 20,
    bounciness: 0,
  }).start();
}
