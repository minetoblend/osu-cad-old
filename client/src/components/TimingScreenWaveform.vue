<template>
  <div class="waveform">
    <canvas ref="canvas" @mousedown="onMouseDown" @mousemove="onMouseMove">

    </canvas>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue, Watch} from "vue-property-decorator";
import {mapState} from "vuex";
import {generateTicks, TimingPoint} from "@shared/timingpoint";

@Component({
  computed: {
    ...mapState(['audio/currentTime', 'audio/audioBuffer'])
  }
})
export default class TimingScreenWaveform extends Vue {

  @Ref() canvas!: HTMLCanvasElement
  context: CanvasRenderingContext2D

  width = 100
  height = 100

  dataPoints: number[] = []

  dragging = false
  lastY = 0

  onMouseDown(ev: MouseEvent) {
    this.dragging = true
    this.lastY = ev.clientY
    window.addEventListener('mouseup', this.onMouseUp)
  }

  onMouseUp(ev: MouseEvent) {
    this.dragging = false
    window.removeEventListener('mouseup', this.onMouseUp)
  }

  onMouseMove(ev: MouseEvent) {
    if (this.dragging) {
      const deltaY = this.lastY - ev.clientY
      const deltaTime = deltaY * 300 / this.canvas.height / 200
      this.$store.dispatch('audio/seek', this.currentTime + deltaTime)
      this.lastY = ev.clientY
    }
  }


  mounted() {
    this.$nextTick(() => {
      this.canvas.width = this.$el.scrollWidth
      this.canvas.height = this.$el.scrollHeight
      this.context = this.canvas.getContext('2d')
      this.draw()
    })
  }


  lastTime = -1

  get currentTime() {
    return this.$store.state.audio.currentTime
  }

  get audioBuffer() {
    return this.$store.state.audio.audioBuffer
  }

  get timingPoints() {
    return this.$store.state.context.timingPoints
  }

  @Watch('audioBuffer')
  createDataPoints() {
    const audioBuffer: AudioBuffer | null = this.$store.state.audio.audioBuffer
    console.log('generating data points')
    if (audioBuffer) {
      const data = audioBuffer.getChannelData(0)
      const numPoints = Math.floor(200 * data.length / audioBuffer.sampleRate)
      const points = Array(numPoints)

      for (let i = 0; i < numPoints; i++) {
        const sampleIndex = Math.floor(i * audioBuffer.sampleRate / 200);
        for (let j = 0; j < 40; j++) {
          points[i] = Math.max(Math.abs(data[Math.floor(sampleIndex + j * audioBuffer.sampleRate / 200 / 10)]));
        }
        points[i-1] = (points[i] + (points[i-1] || points[i])) * 0.5
      }

      this.dataPoints = points
    }
  }


  draw() {

    if (this.dataPoints.length > 0) {


      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.beginPath()
      this.context.fillStyle = 'rgba(255,255,255, 0.3)'
      this.context.moveTo(this.canvas.width / 2, 0)

      this.context.lineWidth = 3
      this.context.lineCap = "round"

      const numPoints = 300

      for (let i = 0; i < numPoints && i < this.dataPoints.length; i++) {


        const point = this.dataPoints[Math.floor(i + this.currentTime * 200) - numPoints / 2] || 0
        this.context.lineTo(this.canvas.width * (1 + point) / 2 + 1, this.canvas.height * i / numPoints)
      }
      for (let i = numPoints - 1; i >= 0; i--) {
        const point = this.dataPoints[Math.floor(i + this.currentTime * 200) - numPoints / 2] || 0
        this.context.lineTo(this.canvas.width * (1 - point) / 2 - 1, this.canvas.height * i / numPoints)
      }
      this.context.fill()

      this.context.beginPath()
      this.context.strokeStyle = '#f5a627'
      this.context.moveTo(0, this.canvas.height / 2)
      this.context.lineTo(this.canvas.width, this.canvas.height / 2)
      this.context.stroke()


      const startTime = this.$store.getters["audio/currentTimeMs"] - numPoints / 2 * 5
      const endTime = this.$store.getters["audio/currentTimeMs"] + numPoints / 2 * 5

      const timingPoints: TimingPoint[] = []

      for (let i = this.timingPoints.length - 1; i >= 0; i--) {
        const timingPoint = this.timingPoints[i]
        if (timingPoint.time >= startTime && timingPoint.time <= endTime)
          timingPoints.unshift(timingPoint)
        else if (timingPoint.time <= endTime) {
          timingPoints.unshift(timingPoint)
          break
        }
      }


      timingPoints.forEach((timingPoint, index) => {
        this.context.beginPath()

        //const deltaTime = deltaY * 300 / this.canvas.height / 200

        const y = this.canvas.height * (0.5 + (timingPoint.time / 1000 - this.currentTime) / 300 * 200);  //this.canvas.height / 2 +  (timingPoint.time - this.currentTime * 1000) / 200 * this.canvas.height / numPoints

        this.context.moveTo(0, y)
        this.context.lineTo(this.canvas.width, y)
        this.context.stroke()

        if (timingPoint.bpm) {
          generateTicks(timingPoint.bpm, timingPoint.time, (timingPoints[index + 1]?.time || endTime)).forEach(tick => {
            const y = this.canvas.height * (0.5 + (tick.time / 1000 - this.currentTime) / 300 * 200);  //this.canvas.height / 2 +  (timingPoint.time - this.currentTime * 1000) / 200 * this.canvas.height / numPoints

            const tickWidth = tick.index == 0 ? 0.25 : 0.125

            this.context.moveTo(this.canvas.width * (0.5 - tickWidth), y)
            this.context.lineTo(this.canvas.width * (0.5 + tickWidth), y)
            this.context.stroke()
          })
        }
      })
      this.lastTime = this.currentTime
    }

    requestAnimationFrame(() => this.draw())
  }

  beforeDestroy() {
    console.log('beforedestroy')
  }

}

</script>

<style lang="scss">

.waveform {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

</style>