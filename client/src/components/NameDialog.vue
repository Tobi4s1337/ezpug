<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" scrollable max-width="380px" persistent>
      <v-card>
        <v-card-title>Registrieren</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="whats-app-info">
          <p>
            Wir freuen uns, dass du EZPUG nutzen möchtest.<br />
            Bevor du anfangen kannst musst du zuerst deinen Username festlegen,
            sowie deine TeamSpeak-Identität verknüpfen.
          </p>
          <v-text-field
            label="Username"
            placeholder="Dein Username"
            filled
            rounded
            v-model="username"
            dense
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="success" @click="submit()" :disabled="!username"
            >Speichern</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import axios from 'axios'
import { mapActions } from 'vuex'

export default {
  name: 'WhatsAppDialog',
  data() {
    return {
      dialog: true,
      username: '',
      error: false
    }
  },
  methods: {
    ...mapActions(['addProfileData']),
    async submit() {
      try {
        const { data } = await axios.patch('/profile', {
          name: this.username
        })

        this.addProfileData({ key: 'name', value: this.username })
        this.dialog = false
      } catch (err) {
        console.log(err)
        this.error = true
      }
    }
  }
}
</script>

<style>
.whats-app-info {
  display: flex;
  margin-top: 12px;
  justify-content: center;
  flex-direction: column;
  align-content: flex-end;
  justify-content: flex-start;
}

.code-input.v-text-field.v-text-field--solo .v-input__control input {
  text-align: center !important;
  letter-spacing: 10px;
  font-size: 32px;
}

.whats-app-link {
  display: flex;
  justify-content: center;
  align-content: center;
  text-align: center;
}
</style>
