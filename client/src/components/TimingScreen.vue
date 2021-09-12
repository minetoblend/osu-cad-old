<template>
  <div class="timing-screen p-5">
    <img class="background" v-if="$store.state.background" :src="$store.state.background" alt="">
    <b-container style="max-width: 1600px; height: 100%">
      <b-row class="h-100">
        <b-col cols="3" class="h-100">
          <b-card class="h-100" bg-variant="dark">
            <timing-screen-waveform/>
          </b-card>
        </b-col>
        <b-col cols="9" class="h-100">
          <b-card class="h-100" bg-variant="dark">
            <b-row>
              <b-col cols="8">
                <div class="timing-point" v-for="(timingPoint, index) in $store.state.context.timingPoints">
                  <button @click="$store.dispatch('audio/seek', timingPoint.time / 1000)">
                    <icon icon="arrow-left"></icon>
                  </button>
                  <b-row>

                    <b-col cols="2">
                      <b-form-input size="sm" class="text-right" :value="timingPoint.time"
                                    @change="setTimingPointTime"
                                    @wheel="moveTimingPoint(timingPoint, $event)"
                      />
                    </b-col>
                    <b-col cols="2" class="d-flex align-items-center">
                      <b-form-input size="sm" :value="timingPoint.bpm" placeholder="bpm" class="text-right flex-grow-1"
                                    @change="setTimingPointBpm(timingPoint, $event)"
                                    @wheel="setTimingPointBpmFromScroll(timingPoint, $event)"
                      >

                      </b-form-input>
                      <button class="remove-button" :class="{disabled: timingPoint.bpm === null}"
                              @click.stop.prevent="setTimingPointBpm(timingPoint, null)">
                        &times;
                      </button>
                    </b-col>
                    <b-col>

                    </b-col>
                    <b-col cols="2">
                      <b-button block size="sm" variant="danger" @click.stop.prevent="removeTimingPoint(timingPoint)">
                        Remove
                      </b-button>
                    </b-col>
                  </b-row>
                </div>
              </b-col>
              <b-col cols="4" class="h-100">
                <b-button block size="lg" variant="primary" @click.left="addTimingPoint" @keydown.prevent>
                  <icon icon="plus" class="mr-2"/>
                  Add timing point at current time
                </b-button>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import TimingScreenWaveform from "./TimingScreenWaveform.vue";
import {Component, Vue} from "vue-property-decorator";
import {TimingPoint} from "@shared/timingpoint";
import * as uuid from 'uuid'

@Component({
  components: {
    TimingScreenWaveform
  }
})
export default class TimingScreen extends Vue {

  timingPoints: TimingPoint[] = []


  addTimingPoint() {
    this.$store.dispatch('applyOperator', {
      operator: 'addTimingPoint',
      params: {
        time: this.$store.getters["audio/currentTimeMs"],
        bpm: 120,
        id: uuid.v4()
      }
    })
  }

  removeTimingPoint(timingPoint: TimingPoint) {
    this.$store.dispatch('applyOperator', {
      operator: 'removeTimingPoint',
      params: {
        id: timingPoint.id
      }
    })
  }

  setTimingPointBpm(timingPoint: TimingPoint, value: string | null) {
    const bpm = value === null ? null : parseFloat(value)

    if (value !== null && (isNaN(bpm) || bpm <= 0)) return

    this.$store.dispatch('applyOperator', {
      operator: 'setTimingPointBpm',
      params: {
        id: timingPoint.id,
        bpm: bpm
      }
    })
  }

  setTimingPointTime(value: string) {
    const time = parseInt(value)
    if (isNaN(time)) return
  }

  moveTimingPoint(timingPoint: TimingPoint, event: WheelEvent) {
    this.$store.dispatch('applyOperator', {
      operator: 'setTimingPointTime',
      params: {
        id: timingPoint.id,
        time: timingPoint.time + (event.deltaY > 0 ? 1 : -1)
      }
    })
  }

  setTimingPointBpmFromScroll(timingPoint: TimingPoint, event: WheelEvent) {
    if (timingPoint.bpm !== null)
      this.setTimingPointBpm(timingPoint, (timingPoint.bpm + (event.deltaY > 0 ? 1 : -1)).toString())
  }
}
</script>

<style lang="scss" scoped>

.timing-point {
  width: 100%;
  background-color: #222222;
  padding: 7px 20px;
  display: block;
  margin-bottom: 10px;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  padding-left: 40px;
  position: relative;

  > button {
    position: absolute;
    width: 30px;
    height: 100%;
    top: 0;
    left: 0;
    border: none;
    background: #f5a627;
    color: white;
  }
}

.timing-screen {
  display: block;
  background-color: black;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.timing-screen > .background {
  position: absolute;
  left: -5%;
  top: -5%;
  right: -5%;
  bottom: -5%;
  width: 110%;
  height: 110%;
  object-fit: cover;
  filter: blur(25px);
}

.remove-button {
  background: none;
  border: none;
  color: #d93737;
  font-size: 20px;

  &.disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}

</style>