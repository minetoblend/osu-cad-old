import {Module} from "vuex";
import store, {RootState} from "./index";
import axios from "axios";

import {Howl} from 'howler';


export interface AudioState {
    currentTime: number
    isPlaying: boolean
    howl: Howl | null
    audioBuffer: AudioBuffer | null
    tick: Howl,
    tickLow: Howl,
}

export const AudioStore: Module<AudioState, RootState> = {
    namespaced: true,
    state: {
        currentTime: 0,
        isPlaying: false,
        howl: null,
        audioBuffer: null,
        tick: new Howl({
            src: '/assets/tick.wav',
        }),
        tickLow: new Howl({
            src: '/assets/tick_low.wav',
        })
    },
    mutations: {
        setAudio: (state, howl: Howl) => {
            if (state.howl)
                state.howl.stop()
            state.howl = howl
        },
        setTime: (state, time) => {
            state.currentTime = time
            state.howl?.seek(time)
        },
        play: state => {
            if (state.howl && !state.isPlaying) {
                state.howl.play()
                state.isPlaying = true
            }
        },
        pause: state => {
            if (state.howl && state.isPlaying) {
                state.howl.pause()
            }
            state.isPlaying = false
        },
        updateTimeFromSource: (state) => {
            if (state.howl) {
                const oldTime = state.currentTime
                state.currentTime = state.howl.seek()
                const timingPoints =
                    store.state.context.timingPoints.filter(it => it.time < state.currentTime * 1000 && it.bpm !== null)
                const timingPoint = timingPoints[timingPoints.length-1]
                if (timingPoint) {
                    const oldBeats = (oldTime - timingPoint.time * 0.001) / 60 * timingPoint.bpm
                    const newBeats = (state.currentTime - timingPoint.time * 0.001) / 60 * timingPoint.bpm
                    if (Math.floor(oldBeats) !== Math.floor(newBeats)) {
                        if(Math.floor(newBeats) % 4  == 0) {
                            state.tick.play()
                        } else {
                            state.tickLow.play()
                        }
                    }

                }
            }
        },
        setAudioBuffer: (state, audioBuffer) => state.audioBuffer = audioBuffer
    },
    actions: {
        async load({commit, state}) {
            const audio = (await axios.get('http://localhost:9000/audio', {responseType: "blob"})).data
            if (audio) {
                const howl = new Howl({
                    src: [URL.createObjectURL(audio)],
                    format: ['mp3'],
                    onload: () => commit('setAudio', howl),
                    onloaderror: (id, msg) => console.error(msg)
                })

                var arrayBuffer;
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                    arrayBuffer = event.target.result;
                    const ctx = new AudioContext()
                    ctx.decodeAudioData(arrayBuffer, buffer => {
                        commit('setAudioBuffer', buffer)
                    })

                };
                fileReader.readAsArrayBuffer(audio);

            }

        },
        play({state, dispatch, commit}) {
            commit('play')
            dispatch("updateLoop")
        },
        pause({commit}) {
            commit('pause')
        },
        seek({state, commit, getters}, time: number) {
            if (time < 0) time = 0
            if (time > getters["duration"])
                time = getters.duration
            commit('setTime', time)
        },
        updateLoop({commit, state, dispatch}) {
            if (state.howl)
                commit('updateTimeFromSource')
            if (state.isPlaying) {
                if (state.isPlaying)
                    window.requestAnimationFrame(() => dispatch('updateLoop'))
            }
        }
    },
    getters: {
        duration: state => state.howl?.duration() || 0,
        currentTimeMs: state => Math.floor(state.currentTime * 1000)
    }
}