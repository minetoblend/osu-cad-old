<template>
  <div class="status-overlay">
    <div class="user-list">
      <h4>
        Users
      </h4>
      <ul>
        <li class="user" v-for="user in $store.state.users">
          {{ user.username }}
        </li>
      </ul>
    </div>

    <div class="notifications">
      <ul>
        <li v-for="notification in $store.state.notifications">
          {{ notification.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class StatusOverlay extends Vue {

}
</script>

<style>
.status-overlay {
  position: absolute;
  left: 0;
  top: 50px;
  right: 0;
  bottom: 100px;
  color: white;
  pointer-events: none;
}

.user-list {
  position: absolute;
  top: 0;
  left: 0;
}

.notifications {
  position: absolute;
  bottom: 0;
}

.user-list ul {
  list-style: none;
  padding-left: 0;
}

.user-list .user {

}
</style>