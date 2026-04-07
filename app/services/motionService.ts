import { Accelerometer } from 'expo-sensors';

let lastShake = 0;

export const startShakeDetection = (onShake: () => void) => {
  Accelerometer.setUpdateInterval(300);

  Accelerometer.addListener(({ x, y, z }) => {
    const total = Math.abs(x + y + z);

    const threshold = 1.8;

    if (total > threshold) {
      const now = Date.now();

      if (now - lastShake > 2000) {
        lastShake = now;
        onShake();
      }
    }
  });
};