import {TimingPoint} from "./timingpoint";

export interface SerializedBeatmapContext {
    metadata: BeatmapMetadata
    timingPoints: TimingPoint[]
}

export interface BeatmapMetadata {
    title: string
    artist: string
    version: string
}