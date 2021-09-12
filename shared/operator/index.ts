import {BeatmapMetadata} from "../beatmap";
import {TimingPoint} from "../timingpoint";


export interface Operator<T> {

    modifiesMetadata?: boolean
    modifyMetadata?(metadata: BeatmapMetadata, params: T): BeatmapMetadata

    modifiesTimingPoints?: boolean
    modifyTimingPoints?(timingPoints: TimingPoint[], params: T): TimingPoint[]

}

export class Operator<T> {

}