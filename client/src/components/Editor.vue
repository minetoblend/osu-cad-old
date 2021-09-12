<template>
  <div class="editor">
    <template v-if="$store.state.context">
      <b-tabs :value="1" class="tab-container" align="end" nav-wrapper-class="editor-toolbar">

        <template #tabs-start>
          <div class="mr-auto">

          </div>

        </template>

        <b-tab title="Song Setup">
          <setup-screen/>
        </b-tab>

        <b-tab title="Timing" :disabled="!$store.state.audio">
          <timing-screen/>
        </b-tab>

        <b-tab title="Compose" :disabled="!$store.state.audio">
          Compose
        </b-tab>

      </b-tabs>
    </template>
    <timeline-overview></timeline-overview>

    <user-list></user-list>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import SetupScreen from "./SetupScreen.vue";
import StatusOverlay from "./StatusOverlay.vue";
import TimelineOverview from "./TimelineOverview.vue";
import TimingScreen from "./TimingScreen.vue";

@Component({
  components: {TimingScreen, TimelineOverview, UserList: StatusOverlay, SetupScreen}
})
export default class Editor extends Vue {

}
</script>

<style>

.editor {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.editor-toolbar {
  background-color: #333 !important;
}

.editor-toolbar .nav-item .nav-link {
  color: white !important;
  border: unset;
}

.editor-toolbar .nav-item .nav-link.active {

  font-weight: bold;
  background-color: #f5a627 !important;
  border-radius: 0;
}

.tab-container {
  height: calc(100% - 80px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-container .tab-content {
  flex-grow: 1;
}

.tab-container .tab-content .tab-pane {
  height: 100%;
}

</style>