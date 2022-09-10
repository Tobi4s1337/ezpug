<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" scrollable max-width="380px" persistent>
      <v-card v-if="!teamSpeakId">
        <v-card-title>Verlinke deine TeamSpeak Identität</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="teamspeak-info">
          <p>
            Um deine TeamSpeak Identität verlinken zu können musst du auf dem
            Server (94.130.180.183) anwesend sein.<br />
          </p>
          <v-btn color="primary" small href="ts3server://94.130.180.183"
            >Verbinden</v-btn
          >
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text style="height: 240px" class="teamspeak-info">
          <v-text-field
            class="mb-2"
            prepend-inner-icon="mdi-magnify"
            v-model="filter"
            placeholder="Suche"
            clearable
            dense
            solo
            outlined
            autofocus
            hide-details
            style="flex: initial"
          ></v-text-field>
          <v-btn
            color="success"
            small
            v-for="user of filteredUsers"
            :key="user.id"
            @click="select(user.id, user.name)"
            class="mb-2"
            >{{ user.name }}</v-btn
          >
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions><p></p></v-card-actions>
      </v-card>
      <v-card v-else>
        <v-card-title>Verlinke deine TeamSpeak Identität</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="teamspeak-info">
          <p>
            Du solltest eine Nachricht von dem TeamSpeak Bot "EZPUG Bot"
            erhalten haben.<br />
            Bitte gebe hier den Code ein, welcher dir von dem Bot zugesendet
            wurde.
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text
          style="height: 240px"
          class="teamspeak-info teamspeak-link"
        >
          <div>
            <p>
              Verlinken mit TeamSpeak User: <strong>{{ nickname }}</strong>
            </p>

            <v-text-field
              class="mb-2 code-input"
              v-model="code"
              placeholder="- - - -"
              solo
              maxlength="4"
              outlined
              :error="error"
              autofocus
              hide-details
              style="flex: initial"
            ></v-text-field>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions><p></p></v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import axios from 'axios'
import { mapActions } from 'vuex'

export default {
  name: 'TeamspeakDialog',
  data() {
    return {
      dialog: true,
      teamSpeakId: null,
      users: [],
      interval: null,
      unlinked: true,
      nickname: '',
      filter: '',
      code: '',
      error: false
    }
  },
  computed: {
    filteredUsers() {
      if (!this.filter || this.filter.length < 1) {
        return this.users
      }

      let filteredUsers = []
      const filter = this.filter.toLowerCase()

      for (const user of this.users) {
        if (user.name.toLowerCase().includes(filter)) {
          filteredUsers.push(user)
        }
      }

      return filteredUsers
    }
  },
  watch: {
    code(newCode, oldCode) {
      if (newCode.length === 4) {
        this.submitCode()
      }
      this.error = false
    }
  },
  methods: {
    ...mapActions(['addProfileData']),
    async submitCode() {
      try {
        const { data } = await axios.post('/profile/teamSpeakCode', {
          teamSpeakId: this.teamSpeakId,
          code: this.code
        })

        if (data.success) {
          // set teamspeakid in user state
          // set status to connected to teamspeak
          this.addProfileData({ key: 'teamSpeakId', value: this.teamSpeakId })
          this.unlinked = false;
          clearInterval(this.interval)
          this.dialog = false

          return
        }

        this.error = true
      } catch (err) {
        console.log(err)
        this.error = true
      }
    },
    async select(teamSpeakId, nickname) {
      try {
        this.teamSpeakId = teamSpeakId
        this.nickname = nickname

        const { data } = await axios.post('/profile/linkTeamSpeak', {
          teamSpeakId: teamSpeakId
        })
      } catch (err) {
        console.log(err)
      }
    },
    async getUsers() {
      try {
        const { data } = await axios.get('/profile/teamSpeakUsers')
        this.users = data

        if (!this.interval && this.unlinked) {
          this.interval = setInterval(() => {
            this.getUsers()
          }, 5000)
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style>
.teamspeak-info {
  display: flex;
  margin-top: 12px;
  justify-content: center;
  flex-direction: column;
  align-content: flex-end;
  justify-content: flex-start;
}

.teamspeak-link {
  display: flex;
  justify-content: center;
  align-content: center;
  text-align: center;
}

.code-input.v-text-field.v-text-field--solo .v-input__control input {
  text-align: center !important;
  letter-spacing: 10px;
  font-size: 32px;
}
</style>
