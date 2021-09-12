import {Operator} from "./index";

export interface MetadataOperatorParams {
    field: 'artist' | 'title',
    value: string
}

export class MetadataOperator extends Operator<MetadataOperatorParams> {

    constructor() {
        super();
        this.modifiesMetadata = true
    }

    modifyMetadata(metadata, params) {
        return {
            ...metadata,
            [params.field]: params.value
        }
    }

}

