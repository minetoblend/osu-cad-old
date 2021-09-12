<template>
  <div class="timeline-overview">
    <template v-if="$store.state.audio.howl">
      <div class="current-progress">
        {{ currentTime | duration }}
      </div>
      <div class="timeline" @mousedown="onTimelineMouseDown" @mousemove="onTimelineMouseMove">
        <div class="timeline-container" ref="timelineContainer">
          <div class="time-marker" :style="{left: `${currentTime / totalDuration * 100}%`}">

          </div>
        </div>
      </div>
      <div class="total-duration">
        {{ totalDuration | duration }}
      </div>
      <div class="controls">
        <button class="control-button" v-if="!$store.state.audio.isPlaying" @click="$store.dispatch('audio/play')" play>
          <icon icon="play"/>
        </button>
        <button class="control-button" v-else @click="$store.dispatch('audio/pause')">
          <icon icon="pause"/>
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">

import {Component, Ref, Vue} from "vue-property-decorator";

import * as zeropad from 'zeropad'

@Component({
  filters: {
    duration: (value: number) => `${zeropad(Math.floor(value / 60), 2)}:${zeropad(Math.floor(value % 60), 2)}:${zeropad(Math.floor((value % 1) * 1000),3)}`
  }
})
export default class TimelineOverview extends Vue {

  @Ref() timelineContainer!: HTMLDivElement

  get totalDuration(): number {
    return this.$store.getters["audio/duration"]
  }

  get currentTime(): number {
    return this.$store.state.audio.currentTime
  }

  onTimelineMouseDown(ev: MouseEvent) {
    this.$store.dispatch('audio/seek', this.timeFromEvent(ev))
  }

  onTimelineMouseMove(ev: MouseEvent) {
    if(ev.buttons === 1) {
      this.$store.dispatch('audio/seek', this.timeFromEvent(ev))
    }
  }

  timeFromEvent(ev: MouseEvent) {
    const rect = this.timelineContainer.getBoundingClientRect()
    const x = ev.clientX - rect.x
    return (x / this.timelineContainer.clientWidth) * this.totalDuration
  }


}

</script>

<style scoped>
.timeline-overview {
  position: absolute;
  left: 0;
  right: 0;
  background-color: #333333;
  height: 80px;
  display: flex;
  align-items: center;
  color: white;
}

.timeline {
  flex-grow: 1;
  align-self: stretch;
  background-color: #222;
  margin: 10px;
  border-radius: 6px;
  position: relative;
  padding: 10px 30px;
  cursor: pointer;
}

.timeline-container {
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}

.time-marker {
  width: 4px;
  height: 100%;
  top: 0;
  border-radius: 2px;
  background-color: #f5a627;
  display: block;
  position: absolute;
}

.current-progress {
  padding: 10px;
  font-size: 25px;
  font-weight: 200;
  width: 200px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}


.total-duration {
  padding: 10px;
  font-size: 25px;
  font-weight: 200;
}

.controls {
  width: 150px;
}

.control-button {
  border: none;
  background: none;
  font-size: 20px;
  color: white;
}

</style>