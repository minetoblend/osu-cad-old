import {User} from "./user";
import {OperatorConfig} from "./operator/operators";

export type UserPendingList = { [key: string]: OperatorConfig }

export interface ServerUpdate {
    users: User[]
    pending: UserPendingList
    apply: OperatorConfig[]
}

export interface ClientUpdate {
    pending: OperatorConfig | null
    apply: OperatorConfig | null
}