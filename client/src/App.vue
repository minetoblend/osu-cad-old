<template>

  <div>
    <Editor v-if="$store.state.status === 'connected'"></Editor>
  </div>


</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Editor from "./components/Editor.vue";

@Component({
  components: {Editor}
})
export default class App extends Vue {


  mounted() {
    this.$store.dispatch('connect', {username: "Minetoblend"})
  }

}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@300;400;600&display=swap');



body {
  font-family: 'Saira Semi Condensed', sans-serif;
  user-select: none;
}
</style>