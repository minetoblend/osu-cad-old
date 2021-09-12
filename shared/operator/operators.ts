import {Operator} from "./index";
import {MetadataOperator} from "./metadata.operator";
import {
    AddTimingPointOperator,
    RemoveTimingPointOperator,
    SetTimingPointBpmOperator,
    SetTimingPointTimeOperator
} from "./timingpoint.operator";


export const operators = {
    'updateMetadata': new MetadataOperator(),
    'addTimingPoint': new AddTimingPointOperator(),
    'removeTimingPoint': new RemoveTimingPointOperator(),
    'setTimingPointBpm': new SetTimingPointBpmOperator(),
    'setTimingPointTime': new SetTimingPointTimeOperator(),
}

export interface OperatorConfig {
    operator: keyof typeof operators,
    params: any
}

export function getOperator(id: keyof typeof operators): Operator<any> | null {
    return operators[id] || null
}