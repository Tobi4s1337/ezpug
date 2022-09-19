<template>
  <v-navigation-drawer width="104" permanent absolute class="sidebar">
    <v-list-item class="sidebar-logo-wrapper">
      <v-list-item-avatar
        tile
        width="80"
        height="80"
        rounded
        class="sidebar-logo"
      >
        <v-img style="border-radius: 13px" src="/logo.png"></v-img>
      </v-list-item-avatar>
    </v-list-item>

    <v-list dense nav class="sidebar-list">
      <router-link
        v-ripple="{ center: true }"
        class="sidebar-button"
        :to="link.url"
        v-for="link in links"
        :key="link.url"
      >
        <div class="sidebar-button-icon">
          <v-icon disabled large>{{ link.icon }}</v-icon>
        </div>
        <div class="sidebar-button-text">{{ link.title }}</div>
      </router-link>
    </v-list>

    <template v-slot:append>
      <div v-ripple="{ center: true }" class="sidebar-button" to="/settings">
        <div class="sidebar-button-icon">
          <v-icon disabled large>mdi-bell-outline</v-icon>
        </div>
        <div class="sidebar-button-text">Notifications</div>
      </div>

      <router-link
        v-ripple="{ center: true }"
        class="sidebar-button"
        to="/settings"
      >
        <div class="sidebar-button-icon">
          <v-icon disabled large>mdi-cog-outline</v-icon>
        </div>
        <div class="sidebar-button-text">Settings</div>
      </router-link>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'NavigationSidebar',
  data() {
    return {
      links: [
        {
          title: 'Home',
          icon: 'mdi-home-outline',
          url: '/'
        },
        {
          title: 'History',
          icon: 'mdi-history',
          url: '/history'
        },
        {
          title: 'Leaderboard',
          icon: 'mdi-podium-gold',
          url: '/leaderboard'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.v-navigation-drawer__border {
  background-color: $border-color !important;
}
.sidebar {
  &.v-navigation-drawer {
    background: $dark-background;
  }
  overflow: visible;
  .v-navigation-drawer__content {
    overflow: visible;
  }
}
.sidebar-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  align-items: center;
  height: 104px;
  text-decoration: none;

  transition: 0.5s background;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(
      90deg,
      rgba(0, 138, 124, 0) 0%,
      rgba(0, 138, 124, 0) 50%,
      rgba(0, 138, 124, 0.7) 100%
    )
    var(--x, 0%) / 200%;

  &:hover {
    --x: 100%;

    .sidebar-button-icon .v-icon--disabled {
      color: white !important;
    }
  }

  &.router-link-exact-active {
    border-right: 3px solid rgb(0, 138, 124);

    box-shadow: 0 0 4px rgba(45, 255, 195, 0.662);
    clip-path: inset(0px -15px 0px 0px);
    transition: 0.5s background;

    background: linear-gradient(
        90deg,
        rgba(0, 138, 124, 0.1) 0%,
        rgba(0, 138, 124, 0.1) 51%,
        rgba(0, 138, 124, 0.585) 100%
      )
      var(--x, 70%) / 200%;

    &:hover {
      --x: 100%;
    }

    .sidebar-button-icon .v-icon--disabled {
      color: white !important;
    }
  }

  .sidebar-button-text {
    color: white;
    font-weight: 400;
    margin-top: 6px;
    font-size: 15px;
  }
}
.sidebar-list {
  padding: 0px;
}

.sidebar-logo-wrapper {
  padding: 0px;
}

.sidebar-logo {
  min-width: 80px;
  margin: auto !important;
  margin-top: 14px !important;
  margin-bottom: 14px !important;
}
</style>
