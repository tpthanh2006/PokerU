import React from "react";
import { type Color, type PathProps, type SkPoint } from "@shopify/react-native-skia";
import type { PieLabelProps } from "./PieLabel";
export type PieSliceData = {
    center: SkPoint;
    color: Color;
    endAngle: number;
    innerRadius: number;
    label: string;
    radius: number;
    sliceIsEntireCircle: boolean;
    startAngle: number;
    sweepAngle: number;
    value: number;
};
type AdditionalPathProps = Partial<Omit<PathProps, "color" | "path">>;
type PieSliceProps = AdditionalPathProps & {
    label?: PieLabelProps;
};
export declare const PieSlice: ({ children, ...rest }: PieSliceProps) => React.JSX.Element;
export {};
