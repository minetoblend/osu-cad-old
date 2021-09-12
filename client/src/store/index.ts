import Vue from 'vue'
import Vuex from 'vuex'
import {User} from "@shared/user";
import {ServerUpdate, UserPendingList} from "@shared/update";
import {BeatmapMetadata, SerializedBeatmapContext} from "@shared/beatmap";
import {getOperator, OperatorConfig, operators} from "@shared/operator/operators";
import axios from "axios";
import {AudioStore} from "./audioState";
import {TimingPoint} from "@shared/timingpoint";

Vue.use(Vuex)

interface Notification {
    message: string,
    createdAt: number
}

interface BeatmapContext {
    metadata: BeatmapMetadata,
    timingPoints: TimingPoint[]
}

export interface RootState {
    status: 'disconnected' | 'connecting' | 'authenticating' | 'connected' | 'error',
    ws: WebSocket | null,
    users: User[],
    self: User | null,
    notifications: Notification[],
    context: BeatmapContext | null,
    background: URL | null,
    local: {
        pending: OperatorConfig | null
        apply: OperatorConfig | null
    },
    remote: {
        pending: UserPendingList
    },
}

export default new Vuex.Store<RootState>({
    state: {
        status: 'disconnected',
        ws: null,
        users: [],
        self: null,
        notifications: [],
        context: null,
        local: {
            pending: null,
            apply: null,
        },
        remote: {
            pending: {}
        },
        background: null,
    },
    mutations: {
        setStatus: (state, status) => state.status = status,
        setWebsocket: (state, ws) => state.ws = ws,
        setSelf: (state, self) => state.self = self,
        setUsers: (state, users) => state.users = users,
        showNotification: (state, notification) => state.notifications.push(notification),
        setContext: (state, context: SerializedBeatmapContext) => state.context = context,
        setPending: (state, pending) => state.local.pending = pending,
        setApply: (state, pending) => state.local.apply = pending,
        setRemotePending: (state, pending) => state.remote.pending = pending,
        setBackground: (state, bg) => state.background = bg,
        applyOperator: (state, config: OperatorConfig) => {
            const operator = getOperator(config.operator)
            if (operator.modifiesMetadata)
                state.context.metadata = operator.modifyMetadata(state.context.metadata, config.params)
            if (operator.modifiesTimingPoints)
                state.context.timingPoints = operator.modifyTimingPoints(state.context.timingPoints, (config.params))
        }
    },
    actions: {
        connect({state, commit, dispatch, rootState}, payload: any) {
            commit('setStatus', 'connecting')
            commit('setWebsocket', new WebSocket('ws://localhost:9000'))
            state.ws.onopen = () => {
                commit("setStatus", 'authenticating')
                state.ws.onmessage = (ev) => {
                    const {message, payload} = JSON.parse(ev.data)
                    this.dispatch('onMessage', {message, payload, ev})
                }
                state.ws.onclose = () => dispatch('onDisconnect')
                state.ws.send(JSON.stringify({message: 'authenticate', payload: {username: payload.username}}))

                dispatch('loadBackground')
                dispatch('audio/load')

            }


            window.addEventListener('keydown', ev => {
                if (ev.key == ' ') {
                    //@ts-ignore
                    if (rootState.audio.isPlaying)
                        dispatch('audio/pause')
                    else
                        dispatch('audio/play')
                }
            })
        },
        onBackgroundUpdated: ({dispatch}) => dispatch('loadBackground'),
        onAudioUpdated: ({dispatch}) => dispatch('audio/load'),
        async loadBackground({commit}) {
            try {
                const background = (await axios.get('http://localhost:9000/background', {responseType: "blob"})).data
                if (background) {
                    commit('setBackground', URL.createObjectURL(background))
                }
            } catch (e) {
                commit('setBackground', URL.createObjectURL(null))
            }
        },
        onDisconnect({commit}) {
            commit("setWebsocket", null)
            commit("setStatus", 'disconnected')
            commit("setUsers", [])
        },
        onMessage({state, commit}, {message, payload}: any) {
            if (state.status === 'authenticating') {
                if (message === 'authenticated') {
                    if (payload.status === 'success') {
                        commit('setSelf', payload.user)
                        commit('setStatus', 'connected')
                    } else {
                        state.ws.close()
                        console.error('could not authenticate')
                        commit('setStatus', 'error')
                    }
                }
            } else {
                this.dispatch(`on${message.charAt(0).toUpperCase()}${message.substr(1)}`, payload)
            }
        },
        onUpdate({state, commit}, update: ServerUpdate) {
            console.log(update)
            commit('setUsers', update.users)
            commit('setRemotePending', update.pending)
            update.apply.forEach(config => commit('applyOperator', config))
        },
        onUserJoined({commit}, {username}) {
            commit('showNotification', {message: `User ${username} joined`})
        },
        onUserLeft({commit}, {username}) {
            commit('showNotification', {message: `User ${username} left`})
        },
        onSetContext({commit}, context: SerializedBeatmapContext) {
            commit('setContext', context)
        },
        setPendingOperator({commit, dispatch, state}, operator: OperatorConfig) {
            commit('setPending', operator)
            dispatch('sendUpdate')
        },
        applyOperator({commit, dispatch, state}, operator: OperatorConfig) {
            commit('setApply', operator)
            commit('setPending', null)
            dispatch('sendUpdate')
        },
        sendUpdate({state, commit}) {
            state.ws.send(JSON.stringify({
                message: 'update',
                payload: {
                    pending: state.local.pending,
                    apply: state.local.apply,
                }
            }))
            commit('setApply', null)
        }
    },
    getters: {
        pendingMetadata(state) {
            let metadata = state.context.metadata

            Object.entries(state.remote.pending).forEach(([user, config]: [string, OperatorConfig]) => {
                const operator = getOperator(config.operator)
                if (operator.modifiesMetadata && user !== state.self!.id)
                    metadata = operator.modifyMetadata(metadata, config.params)
            })
            return metadata
        },
        user: state => (id: string) => state.users.filter(user => user.id === id)[0] || null
    },
    modules: {
        audio: AudioStore
    }
})