<template>
  <v-container fluid>
    <whats-app-dialog v-if="whatsAppDialog" />
    <v-layout row wrap>
      <Heading :title="$t('myProfile.TITLE')" />
      <v-flex xs12 sm8 offset-sm2>
        <v-dialog v-model="dialog" max-width="400px">
          <template v-slot:activator="{ on }">
            <v-flex text-xs-center>
              <v-btn
                small
                text
                v-on="on"
                color="secondary"
                @click="triggerChangePassword = true"
                class="btnChangePassword"
                >{{ $t('myProfile.CHANGE_MY_PASSWORD') }}</v-btn
              >
            </v-flex>
          </template>
          <v-card>
            <ValidationObserver v-slot="{ handleSubmit }">
              <form @submit.prevent="handleSubmit(save)">
                <v-card-title>
                  <span class="headline">
                    {{ $t('myProfile.CHANGE_MY_PASSWORD') }}
                  </span>
                </v-card-title>
                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <template v-if="triggerChangePassword">
                        <v-flex xs12>
                          <ValidationProvider
                            rules="required|min:5"
                            v-slot="{ errors }"
                          >
                            <v-text-field
                              id="oldPassword"
                              name="oldPassword"
                              type="password"
                              :label="$t('myProfile.CURRENT_PASSWORD')"
                              v-model="oldPassword"
                              :error="errors.length > 0"
                              :error-messages="errors[0]"
                              key="oldPassword"
                              autocomplete="off"
                            ></v-text-field>
                          </ValidationProvider>
                        </v-flex>
                        <v-flex xs12>
                          <ValidationProvider
                            rules="required|min:5"
                            v-slot="{ errors }"
                            vid="newPassword"
                          >
                            <v-text-field
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              :label="$t('myProfile.NEW_PASSWORD')"
                              v-model="newPassword"
                              :error="errors.length > 0"
                              :error-messages="errors[0]"
                              key="newPassword"
                              ref="password"
                              autocomplete="off"
                            ></v-text-field>
                          </ValidationProvider>
                        </v-flex>
                        <v-flex xs12>
                          <ValidationProvider
                            rules="required|min:5|confirmed:newPassword"
                            v-slot="{ errors }"
                          >
                            <v-text-field
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              :label="$t('myProfile.CONFIRM_NEW_PASSWORD')"
                              v-model="confirmPassword"
                              :error="errors.length > 0"
                              :error-messages="errors[0]"
                              key="confirmPassword"
                              autocomplete="off"
                            ></v-text-field>
                          </ValidationProvider>
                        </v-flex>
                      </template>
                    </v-layout>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="red lighten3" text @click="close">
                    {{ $t('dataTable.CANCEL') }}
                  </v-btn>
                  <SubmitButton
                    id="updatePassword"
                    text
                    :buttonText="$t('dataTable.SAVE')"
                    color="green"
                  />
                </v-card-actions>
              </form>
            </ValidationObserver>
          </v-card>
        </v-dialog>
        <ValidationObserver v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(submit)">
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 md6>
                  <ValidationProvider
                    rules="required|email"
                    v-slot="{ errors }"
                  >
                    <v-text-field
                      id="email"
                      name="email"
                      type="email"
                      :label="$t('myProfile.EMAIL')"
                      v-model="email"
                      :error="errors.length > 0"
                      :error-messages="errors[0]"
                      disabled
                      autocomplete="off"
                    ></v-text-field>
                  </ValidationProvider>
                </v-flex>
                <v-flex xs12 md6>
                  <ValidationProvider rules="required" v-slot="{ errors }">
                    <v-text-field
                      id="name"
                      name="name"
                      type="text"
                      :label="$t('myProfile.NAME')"
                      v-model="name"
                      :error="errors.length > 0"
                      :error-messages="errors[0]"
                      autocomplete="off"
                    ></v-text-field>
                  </ValidationProvider>
                </v-flex>
                <v-flex text-xs-center mt-5>
                  <SubmitButton
                    :buttonText="$t('myProfile.SAVE')"
                    customClass="btnSave"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </form>
        </ValidationObserver>
      </v-flex>
      <ErrorMessage />
      <SuccessMessage />
    </v-layout>
    <v-layout>
      <v-flex xs12 v-if="!steamUrl">
        <h3 class="mt-5 mb-2">Link Your Steam Account</h3>
        <SteamAuth type="LINK" @steam-link="onSteamLink" />
      </v-flex>
      <v-flex xs12 v-else>
        <h3 class="mt-5 mb-2">Your Steam Profile</h3>
        <v-btn color="secondary" :href="steamUrl" target="_blank">Steam</v-btn>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex xs12 v-if="teamSpeakId">
        <h3 class="mt-5 mb-2">Unlink Your TeamSpeak Identity</h3>
        <v-btn color="secondary" @click="unlinkTeamSpeak()">Unlink TeamSpeak</v-btn>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex xs12 v-if="hasPhoneNumber">
        <h3 class="mt-5 mb-2">Update your WhatsApp Number</h3>
        <v-btn color="secondary" @click="whatsAppDialog = true">Link WhatsApp</v-btn>
        <div class="whats-app-switch-wrapper">
          <v-switch
            v-model="whatsAppEnabled"
            inset
            @change="toggleWhatsAppEnabled()"
            label="Toggle WhatsApp Notifications"
          ></v-switch>
        </div>
      </v-flex>
      <v-flex xs12 v-else>
        <h3 class="mt-5 mb-2">Link your WhatsApp Number</h3>
        <v-btn color="secondary" @click="whatsAppDialog = true">Link WhatsApp</v-btn>
        <v-switch
          inset
          label="Enable WhatsApp Notifications"
          disabled="true"
        ></v-switch>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import WhatsAppDialog from '@/components/WhatsAppDialog.vue'

export default {
  metaInfo() {
    return {
      title: this.$store.getters.appTitle,
      titleTemplate: `${this.$t('myProfile.TITLE')} - %s`
    }
  },
  components: { WhatsAppDialog },
  data() {
    return {
      dialog: false,
      triggerChangePassword: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      searchInput: '',
      whatsAppDialog: false
    }
  },
  computed: {
    name: {
      get() {
        return this.$store.state.profile.profile.name
      },
      set(value) {
        const data = {
          key: 'name',
          value
        }
        this.addProfileData(data)
      }
    },
    email() {
      return this.$store.state.profile.profile.email
    },
    steamUrl() {
      return this.$store.state.profile.profile.steamUrl
    },
    teamSpeakId() {
      return this.$store.state.profile.profile.teamSpeakId
    },
    hasPhoneNumber() {
      return !!this.$store.state.profile.profile.phone
    },
    whatsAppEnabled() {
      return this.$store.state.profile.profile.whatsAppEnabled
    }
  },
  methods: {
    ...mapActions([
      'changeMyPassword',
      'getProfile',
      'addProfileData',
      'saveProfile',
      'unlinkTeamSpeak',
      'toggleWhatsAppEnabled'
    ]),
    async submit() {
      await this.saveProfile({
        name: this.name
      })
    },
    close() {
      this.triggerChangePassword = false
      this.dialog = false
    },
    async save() {
      try {
        await this.changeMyPassword({
          oldPassword: this.oldPassword,
          newPassword: this.newPassword
        })
        this.oldPassword = ''
        this.newPassword = ''
        this.confirmPassword = ''
        this.triggerChangePassword = false
        this.close()
        return
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.oldPassword = ''
        this.newPassword = ''
        this.confirmPassword = ''
        this.triggerChangePassword = false
        this.close()
      }
    },
    async onSteamLink(steamUserData) {
      this.addProfileData({ key: 'steamId', value: steamUserData.steamId })
      this.addProfileData({ key: 'csgoId', value: steamUserData.csgoId })
      this.addProfileData({ key: 'steamUrl', value: steamUserData.steamUrl })
    }
  },
  async mounted() {
    await this.getProfile()
  }
}
</script>

<style scoped>
.whats-app-switch-wrapper {
  display: block ruby;
}
</style>
