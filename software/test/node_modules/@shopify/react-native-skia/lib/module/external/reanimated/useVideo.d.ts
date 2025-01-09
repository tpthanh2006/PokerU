import type { SharedValue } from "react-native-reanimated";
import type { SkImage } from "../../skia/types";
type Animated<T> = SharedValue<T> | T;
interface PlaybackOptions {
    looping: Animated<boolean>;
    paused: Animated<boolean>;
    seek: Animated<number | null>;
    volume: Animated<number>;
}
export declare const useVideo: (source: string | null, userOptions?: Partial<PlaybackOptions>) => {
    currentFrame: SharedValue<SkImage | null>;
    currentTime: SharedValue<number>;
    duration: number;
    framerate: number;
    rotation: import("../../skia/types").VideoRotation;
    size: {
        width: number;
        height: number;
    };
};
export {};
