<template>
  <div class="setup-screen p-5">
    <img class="background" v-if="$store.state.background" :src="$store.state.background" alt="">
    <b-container>
      <b-card>
        <template #header>
          <img class="background" v-if="$store.state.background" :src="$store.state.background" alt="">
          <div class="gradient"></div>
          <h2>{{ $store.state.context.metadata.title || 'Song Setup' }}</h2>
          <h3>{{ $store.state.context.metadata.artist || '' }}</h3>
        </template>

        <b-form-group label="Audio File">
          <b-form-file
              @input="onBeatmapAudioSelected"
              placeholder="Choose a file or drop it here..."
              drop-placeholder="Drop file here..."
              accept=".mp3, .wav"
          />
        </b-form-group>

        <b-form-group label="Background Image">
          <b-form-file
              @input="onBeatmapBackgroundSelected"
              placeholder="Choose a file or drop it here..."
              drop-placeholder="Drop file here..."
              accept=".jpg, .jpeg, .png"
          />
        </b-form-group>

        <b-form-group label="Artist">
          <div v-for="user in [getEditingUser('artist')]">

            <b-input
                type="text"
                :value="metadata.artist"
                @input="onInput('artist', $event)"
                @change="onUpdate('artist', $event)"
                @abort="onAbort"
                :disabled="user !== null"
            />

            <div v-if="user">
              {{ user.username }} is editing this value
            </div>
          </div>
        </b-form-group>

        <b-form-group label="Title">
          <div v-for="user in [getEditingUser('title')]">

            <b-input :value="metadata.title"
                     @input="onInput('title', $event)"
                     @change="onUpdate('title', $event)"
                     @abort="onAbort"
                     :disabled="user !== null"
            />

            <div v-if="user">
              {{ user.username }} is editing this value
            </div>
          </div>
        </b-form-group>

        <b-form-group label="Difficulty Name">
          <div v-for="user in [getEditingUser('version')]">

            <b-input :value="metadata.version"
                     @input="onInput('version', $event)"
                     @change="onUpdate('version', $event)"
                     @abort="onAbort"
                     :disabled="user !== null"
            />

            <div v-if="user">
              {{ user.username }} is editing this value
            </div>
          </div>
        </b-form-group>

      </b-card>
    </b-container>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {OperatorConfig} from "../../../shared/operator/operators"
//@ts-ignore
import * as Vue2Dropzone from 'vue2-dropzone'
import axios from "axios";

@Component({
  components: {
    dropzone: Vue2Dropzone
  }
})
export default class SetupScreen extends Vue {

  onInput(field, value) {
    this.$store.dispatch('setPendingOperator', {
      operator: 'updateMetadata',
      params: {field, value}
    })
  }

  onUpdate(field, value) {
    this.$store.dispatch('applyOperator', {
      operator: 'updateMetadata',
      params: {
        field, value
      }
    })
  }

  onAbort() {

  }

  get metadata() {
    return this.$store.getters["pendingMetadata"]
  }

  getEditingUser(field: string) {
    return Object.entries(this.$store.state.remote.pending).map(([user, config]: [string, OperatorConfig]) => {

      if (config.operator === 'updateMetadata' && config.params.field === field && user !== this.$store.state.self.id) {
        return this.$store.getters['user'](user)
      }

      return null
    }).filter(it => it)[0] || null
  }

  async onBeatmapBackgroundSelected(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    await axios.post('http://localhost:9000/background', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })
  }

  async onBeatmapAudioSelected(file: File) {
    const formData = new FormData()
    formData.append('audio', file)
    await axios.post('http://localhost:9000/audio', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })
  }

}
</script>

<style>

.setup-screen {
  display: block;
  background-color: black;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.setup-screen > .background {
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

.setup-screen .card {
  border: none;
  overflow: hidden;
}

.setup-screen .card > .card-header {
  position: relative;
  overflow: hidden;
  height: 250px;
}

.setup-screen .card > .card-header .gradient {
  content: '';
  position: absolute;
  display: block;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(0deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%);
}

.setup-screen .card > .card-header > img {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  object-fit: cover;
}

.setup-screen .card > .card-header > h2 {
  position: absolute;
  left: 20px;
  bottom: 10px;
  font-size: 50px;
  font-weight: 100;
  color: white;
}

.setup-screen .card > .card-header > h3 {
  position: absolute;
  left: 20px;
  bottom: 60px;
  font-size: 25px;
  font-weight: 100;
  color: white;
}

</style>