<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" scrollable max-width="380px" persistent>
      <v-card v-if="!requestedPhone">
        <v-card-title>Verlinke WhatsApp</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="whats-app-info">
          <p>
            Wenn du möchtest kannst du deine Handynummer verlinken, sodass wir
            dich über WhatsApp benachrichtigen können, wenn ein Spiel gefunden
            wurde.
            <br /><br />
            Ebenso kannst du dich dadurch auf "Bereit" stellen, selbst wenn du
            nicht aktiv am Computer bist.
          </p>
          <br />
          <VuePhoneNumberInput
            default-country-code="DE"
            dark
            v-model="phone"
            @update="onUpdate"
            class="mb-5"
            size="lg"
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn small color="primary" @click="dialog = false">Abbrechen</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            small
            color="success"
            @click="submitPhone()"
            :disabled="!phoneDetails.isValid"
            >Verknüpfen</v-btn
          ></v-card-actions
        >
      </v-card>
      <v-card v-else>
        <v-card-title>Verlinke deine TeamSpeak Identität</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="whats-app-info">
          <p>
            Du solltest eine Nachricht von einem WahtsApp Account "EZPUG"
            erhalten haben.<br />
            Bitte gebe hier den Code ein, welcher dir von dem Bot zugesendet
            wurde.
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text
          style="height: 240px"
          class="whats-app-info whats-app-link"
        >
          <div>
            <v-otp-input
              style="width: 240px; margin: auto"
              v-model="code"
              @finish="submitCode"
              autofocus
              :error="error"
              length="4"
            ></v-otp-input>
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

import VuePhoneNumberInput from 'vue-phone-number-input'
import 'vue-phone-number-input/dist/vue-phone-number-input.css'

export default {
  name: 'WhatsAppDialog',
  data() {
    return {
      dialog: true,
      phone: '',
      unlinked: true,
      code: '',
      error: false,
      phoneDetails: {},
      requestedPhone: ''
    }
  },
  components: { VuePhoneNumberInput },
  methods: {
    ...mapActions(['addProfileData']),
    onUpdate(payload) {
      this.phoneDetails = payload
    },
    async submitCode() {
      try {
        const { data } = await axios.post('/profile/whatsAppCode', {
          phone: this.requestedPhone,
          code: this.code
        })

        this.addProfileData({ key: 'phone', value: this.phone })
        this.dialog = false
      } catch (err) {
        console.log(err)
        this.error = true
      }
    },
    async submitPhone() {
      try {
        const { data } = await axios.post('/profile/linkWhatsApp', {
          phone: this.phoneDetails.countryCallingCode + this.phone
        })

        this.requestedPhone = this.phoneDetails.countryCallingCode + this.phone
      } catch (err) {
        console.log(err)
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
