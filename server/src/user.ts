import {User} from "../../shared/user";

import * as WebSocket from "ws"
import {OperatorConfig} from "../../shared/operator/operators";

export interface ClientUser extends User {
    socket: WebSocket.Socket
    authenticated: boolean
    pending: OperatorConfig | null
    apply: OperatorConfig | null
}