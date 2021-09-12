import {Operator} from "./index";
import {TimingPoint} from "../timingpoint";

export class AddTimingPointOperator extends Operator<TimingPoint> {

    constructor() {
        super();
        this.modifiesTimingPoints = true
    }

    modifyTimingPoints(timingPoints: TimingPoint[], params: TimingPoint): TimingPoint[] {
        let index = 0
        for (let i = 0; i < timingPoints.length; i++) {
            index = i + 1
            if (timingPoints[i].time > params.time)
                break
        }
        timingPoints.splice(index, 0, params)
        return timingPoints
    }

}

export class RemoveTimingPointOperator extends Operator<{ id: string }> {
    constructor() {
        super();
        this.modifiesTimingPoints = true
    }

    modifyTimingPoints(timingPoints: TimingPoint[], {id}: { id: string }): TimingPoint[] {
        console.log(id)
        return timingPoints.filter(t => t.id !== id)
    }
}

export class SetTimingPointTimeOperator extends Operator<{ id: string, time: number }> {

    constructor() {
        super();
        this.modifiesTimingPoints = true
    }

    modifyTimingPoints(timingPoints: TimingPoint[], {id, time}: { id: string; time: number }): TimingPoint[] {
        timingPoints.forEach(t => {
            if (t.id === id) {
                t.time = time
            }
        })
        return timingPoints
    }

}

export class SetTimingPointBpmOperator extends Operator<{ id: string, bpm: number }> {

    constructor() {
        super();
        this.modifiesTimingPoints = true
    }

    modifyTimingPoints(timingPoints: TimingPoint[], {id, bpm}: { id: string; bpm: number }): TimingPoint[] {
        timingPoints.forEach(t => {
            if (t.id === id) {
                t.bpm = bpm
            }
        })
        return timingPoints
    }

}