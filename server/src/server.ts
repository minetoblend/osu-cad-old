import {Express} from "express";
import {ClientUser} from "./user";
import * as WebSocket from "ws"
import * as http from "http"
import * as uuid from 'uuid'
import {debounce} from 'ts-debounce';
import {ClientUpdate, ServerUpdate, UserPendingList} from "../../shared/update";
import {BeatmapMetadata, SerializedBeatmapContext} from "../../shared/beatmap";
import {getOperator, OperatorConfig} from "../../shared/operator/operators";

import * as multer from 'multer'
import {TimingPoint} from "../../shared/timingpoint";

export class Server {

    users: ClientUser[] = []

    private wss: WebSocket.Server;

    private metadata: BeatmapMetadata = {
        artist: '',
        title: '',
        version: ''
    }

    private timingPoints: TimingPoint[] = []

    private background: File | null = null;
    private audio: File | null = null;

    constructor(private readonly app: Express, private readonly server: http.Server) {
        this.wss = new WebSocket.Server({server})
        this.wss.on('connection', socket => this.onConnection(socket))

        app.post('/audio', multer({storage: multer.memoryStorage()}).single('audio'), (req, res) => {
            // @ts-ignore
            const file = req.file
            if (file && file.mimetype.startsWith('audio/')) {
                this.setAudio(file)
                res.sendStatus(200)
            } else {
                res.sendStatus(400)
            }
        })

        app.get('/audio', (req, res) => {
            if (this.audio) {
                //@ts-ignore
                res.type(this.audio.mimetype)
                //@ts-ignore
                res.send(this.audio.buffer)
            } else {
                res.sendStatus(404)
            }
        })

        app.post('/background', multer({storage: multer.memoryStorage()}).single('image'), (req, res) => {
            // @ts-ignore
            const file = req.file
            if (file && file.mimetype.startsWith('image/')) {
                this.setBackground(file)
                res.sendStatus(200)
            } else {
                res.sendStatus(400)
            }
        })

        app.get('/background', (req, res) => {
            if (this.background) {
                //@ts-ignore
                res.type(this.background.mimetype)
                //@ts-ignore
                res.send(this.background.buffer)
            } else {
                res.sendStatus(404)
            }
        })
    }

    onConnection(socket: WebSocket.Socket) {
        const user: ClientUser = {
            socket,
            authenticated: false,
            username: null,
            id: uuid.v4(),
            pending: null,
            apply: null
        }
        socket.onmessage = (ev: MessageEvent) => this.onMessage(user, ev)
        socket.onclose = () => this.removeUser(user)
    }

    private removeUser(user: ClientUser) {
        const index = this.users.findIndex(u => u.id === user.id)
        if (index >= 0)
            this.users.splice(index, 1)
        this.broadcast('userLeft', {
            username: user.username,
            id: user.id
        })
        this.sendUpdate()
    }

    private broadcast<T>(message: string, payload: T) {
        this.users.forEach(user => user.socket.send(JSON.stringify({
            message,
            payload,
        })))
    }

    private sendMessage<T>(user: ClientUser, message: string, payload: T) {
        user.socket.send(JSON.stringify({
            message,
            payload,
        }))
    }

    private onMessage(user: ClientUser, ev: MessageEvent) {
        const data = (JSON.parse(ev.data))

        if (!user.authenticated) {
            if (data.message !== 'authenticate')
                return this.sendMessage(user, 'authenticated', {status: 'error'})
            const username = data.payload?.username
            if (!username)
                return this.sendMessage(user, 'authenticated', {status: 'error'})

            user.username = `User ${this.users.length + 1}`
            user.authenticated = true
            this.sendMessage(user, 'authenticated', {
                status: 'success',
                user: {
                    username: user.username,
                    id: user.id
                }
            })

            this.users.push(user)
            this.broadcast('userJoined', {
                username: user.username,
                id: user.id
            })
            this.sendContext(user)
            this.sendUpdate()
        } else {
            if (data.message === 'update') {
                this.onClientUpdate(user, data.payload as ClientUpdate)
            }
        }
    }

    private onClientUpdate(user: ClientUser, update: ClientUpdate) {
        user.pending = update.pending
        user.apply = update.apply

        this.sendUpdate()
    }

    private sendContext(user: ClientUser) {
        this.sendMessage(user, 'setContext', this.serializedContext)
    }

    private sendUpdateImmediately() {

        const pending: UserPendingList = {}
        const apply: OperatorConfig[] = []

        this.users.forEach(user => {
            if (user.pending) {
                pending[user.id] = user.pending
            }
            if (user.apply) {
                apply.push(user.apply)
            }
        })

        this.applyChanges()

        this.broadcast<ServerUpdate>('update', {
            users: this.users.map(u => ({username: u.username, id: u.id})),
            pending,
            apply
        })
    }

    get serializedContext(): SerializedBeatmapContext {
        return {
            metadata: this.metadata,
            timingPoints: this.timingPoints
        }
    }

    private readonly sendUpdate: Function = this.sendUpdateImmediately// debounce(this.sendUpdateImmediately, 100, {isImmediate: true, maxWait: 500})

    private applyChanges() {
        this.users.filter(user => user.apply).forEach(user => {
            const operator = getOperator(user.apply.operator)
            if (operator.modifiesMetadata)
                this.metadata = operator.modifyMetadata(this.metadata, user.apply.params)
            if (operator.modifiesTimingPoints)
                this.timingPoints = operator.modifyTimingPoints(this.timingPoints, user.apply.params)
            user.apply = null
        })
    }

    private setBackground(file: any) {
        this.background = file
        this.broadcast('backgroundUpdated', {})
    }

    private setAudio(file: any) {
        this.audio = file
        this.broadcast('audioUpdated', {})
    }
}