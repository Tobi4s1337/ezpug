_
<template>
  <v-container class="drops-wrapper">
    <v-row style="padding-bottom: 0px">
      <v-col cols="12">
        <v-app-bar rounded>
          <v-toolbar-title color="blue"
            >Drops Admin Dashboard -
            <span class="status-text" :class="{ enabled: enabled }">{{
              enabled ? 'Aktiv' : 'Nicht aktiv'
            }}</span>
            | Odds: {{ odds }} | Interval:
            {{ interval / 1000 }}s</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-btn @click="intervalDialog = true" class="mr-2"
            >Interval anpassen</v-btn
          >
          <v-btn @click="toggleDrops()">{{
            enabled ? 'Drops deaktivieren' : 'Drops aktivieren'
          }}</v-btn>
        </v-app-bar>
      </v-col>
    </v-row>
    <v-row style="margin-top: 0px">
      <v-col cols="12">
        <v-data-table
          :loading="dataTableLoading"
          :no-data-text="$t('dataTable.NO_DATA')"
          :no-results-text="$t('dataTable.NO_RESULTS')"
          :headers="headers"
          :items="items"
          :options.sync="pagination"
          :items-per-page="25"
          :server-items-length="totalItems"
          class="elevation-1"
          :footer-props="{
            'items-per-page-text': $t('dataTable.ROWS_PER_PAGE'),
            'items-per-page-options': [25, 50]
          }"
        >
          <template v-slot:top>
            <v-layout wrap>
              <v-flex xs12 sm12 md4 mt-3 pl-4>
                <div class="text-left">
                  <v-toolbar-title>Verwalte Drops</v-toolbar-title>
                </div>
              </v-flex>
              <v-flex xs12 sm6 md4 px-3>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  :label="$t('dataTable.SEARCH')"
                  single-line
                  hide-details
                  clearable
                  id="search"
                  clear-icon="mdi-close"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4 mb-2 mt-2 pr-2>
                <ValidationObserver
                  ref="observer"
                  v-slot="{ invalid }"
                  tag="form"
                  @submit.prevent="submit()"
                >
                  <v-dialog
                    v-model="dialog"
                    max-width="500px"
                    content-class="dlgNewEditItem"
                  >
                    <template v-slot:activator="{ on }">
                      <div class="text-right">
                        <v-btn color="secondary" v-on="on" class="btnNewItem">
                          <v-icon class="mr-2">mdi-plus</v-icon>
                          {{ $t('dataTable.NEW_ITEM') }}
                        </v-btn>
                      </div>
                    </template>
                    <v-card>
                      <v-card-title>
                        <span class="headline">{{ formTitle }}</span>
                      </v-card-title>

                      <v-card-text>
                        <v-container grid-list-md>
                          <v-layout wrap>
                            <template v-if="editedItem._id">
                              <v-flex xs12 md6>
                                <v-checkbox
                                  v-model="editItem.redeemed"
                                  :label="`Eingelöst: ${editItem.redeemed.toString()}`"
                                ></v-checkbox>
                              </v-flex>
                            </template>
                            <template v-if="!editedItem._id">
                              <v-flex xs12 md12>
                                <v-text-field
                                  required
                                  id="name"
                                  label="Drop Name"
                                  name="name"
                                  v-model="editedItem.name"
                                  autocomplete="off"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md6>
                                <v-text-field
                                  required
                                  id="amount"
                                  label="Anzahl / Menge"
                                  name="amount"
                                  v-model="editedItem.amount"
                                  autocomplete="off"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md6>
                                <v-text-field
                                  required
                                  id="image"
                                  label="Drop Grafik / Bild"
                                  name="image"
                                  v-model="editedItem.image"
                                  autocomplete="off"
                                ></v-text-field>
                              </v-flex>
                              <v-flex xs12 md12>
                                <v-text-field
                                  required
                                  id="sound"
                                  label="Drop sound"
                                  name="sound"
                                  v-model="editedItem.sound"
                                  autocomplete="off"
                                ></v-text-field>
                              </v-flex>
                            </template>
                          </v-layout>
                        </v-container>
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="red lighten3"
                          text
                          @click="close"
                          class="btnCancel"
                          >{{ $t('dataTable.CANCEL') }}</v-btn
                        >
                        <v-btn
                          color="green lighten3"
                          text
                          @click="save"
                          class="btnSave"
                          :disabled="invalid"
                          >{{ $t('dataTable.SAVE') }}</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </ValidationObserver>
              </v-flex>
            </v-layout>
          </template>
          <template v-slot:item.image="{ item }">
            <div
              style="
                border-radius: 8px;
                border-radius: 8px;
                justify-content: center;
                display: flex;
              "
            >
              <img :src="item.image" :alt="item.name" height="36px" />
            </div>
          </template>
          <template v-slot:[`item._id`]="{ item }">
            <v-layout class="justify-center">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn id="edit" icon v-on="on" @click="editItem(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('dataTable.EDIT') }}</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn id="delete" icon v-on="on" @click="deleteItem(item)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('dataTable.DELETE') }}</span>
              </v-tooltip>
            </v-layout>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">
            {{ getFormat(item.createdAt) }}
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            {{ getFormat(item.updatedAt) }}
          </template>
          <template
            v-slot:[`footer.page-text`]="{ pageStart, pageStop, itemsLength }"
          >
            {{ pageStart }} - {{ pageStop }}
            {{ $t('dataTable.OF') }}
            {{ itemsLength }}
          </template>
          <template v-slot:no-data>{{ $t('dataTable.NO_DATA') }}</template>
          <template v-slot:no-results>{{
            $t('dataTable.NO_RESULTS')
          }}</template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog
      v-model="intervalDialog"
      max-width="500px"
      content-class="dlgNewEditItem"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Interval anpassen</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col class="pr-4">
              <v-slider
                v-model="slider"
                class="align-center"
                max="3600"
                min="60"
                hide-details
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="slider"
                    class="mt-0 pt-0"
                    hide-details
                    single-line
                    type="number"
                    style="width: 60px"
                  ></v-text-field>
                </template>
              </v-slider>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red lighten3"
            text
            @click="intervalDialog = false"
            class="btnCancel"
            >{{ $t('dataTable.CANCEL') }}</v-btn
          >
          <v-btn
            color="green lighten3"
            text
            @click="saveInterval"
            class="btnSave"
            >{{ $t('dataTable.SAVE') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ErrorMessage />
    <SuccessMessage />
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { getFormat, buildPayloadPagination } from '@/utils/utils.js'
import axios from 'axios'

export default {
  metaInfo() {
    return {
      title: this.$store.getters.appTitle,
      titleTemplate: `Drops Admin Dashboard - %s`
    }
  },
  data() {
    return {
      intervalDialog: false,
      enabled: false,
      _interval: null,
      interval: 0,
      odds: 0,
      slider: 0,
      dataTableLoading: true,
      delayTimer: null,
      dialog: false,
      search: '',
      pagination: {},
      editedItem: {},
      defaultItem: {},
      fieldsToSearch: ['name']
    }
  },
  beforeRouteLeave(to, from, next) {
    clearInterval(this._interval)
    next()
  },
  computed: {
    formTitle() {
      return this.editedItem._id
        ? this.$t('dataTable.EDIT_ITEM')
        : this.$t('dataTable.NEW_ITEM')
    },
    headers() {
      return [
        {
          text: '',
          align: 'center',
          value: 'image',
          width: 36,
          sortable: false
        },
        {
          text: this.$i18n.t('dataTable.ACTIONS'),
          value: '_id',
          sortable: false,
          width: 100
        },
        {
          text: 'Drop Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Gedropt',
          align: 'left',
          sortable: true,
          value: 'dropped'
        },
        {
          text: 'Eingelöst',
          align: 'left',
          sortable: true,
          value: 'redeemed'
        },
        {
          text: 'Besitzer',
          align: 'left',
          sortable: true,
          value: 'ownedBy'
        }
      ]
    },
    items() {
      return this.$store.state.adminDrops.drops
    },
    totalItems() {
      return this.$store.state.adminDrops.totalDrops
    }
  },
  watch: {
    dialog(value) {
      return value ? true : this.close()
    },
    pagination: {
      async handler() {
        try {
          this.dataTableLoading = true
          await this.getDrops(
            buildPayloadPagination(this.pagination, this.buildSearch())
          )
          this.dataTableLoading = false
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          this.dataTableLoading = false
        }
      },
      deep: true
    },
    async search() {
      clearTimeout(this.delayTimer)
      this.delayTimer = setTimeout(() => {
        this.doSearch()
      }, 400)
    }
  },
  methods: {
    ...mapActions(['getDrops', 'updateDrop', 'saveDrops', 'deleteDrop']),
    getFormat(date) {
      window.__localeId__ = this.$store.getters.locale
      return getFormat(date, 'iii, MMMM d yyyy, h:mm a')
    },
    async doSearch() {
      try {
        this.dataTableLoading = true
        await this.getDrops(
          buildPayloadPagination(this.pagination, this.buildSearch())
        )
        this.dataTableLoading = false
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.dataTableLoading = false
      }
    },
    buildSearch() {
      return this.search
        ? { query: this.search, fields: this.fieldsToSearch.join(',') }
        : {}
    },
    editItem(item) {
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    async deleteItem(item) {
      try {
        const response = await this.$confirm(
          this.$t('common.DO_YOU_REALLY_WANT_TO_DELETE_THIS_ITEM'),
          {
            title: this.$t('common.WARNING'),
            buttonTrueText: this.$t('common.DELETE'),
            buttonFalseText: this.$t('common.CANCEL'),
            buttonTrueColor: 'red lighten3',
            buttonFalseColor: 'green'
          }
        )
        if (response) {
          this.dataTableLoading = true
          await this.deleteDrop(item._id)
          await this.getDrops(
            buildPayloadPagination(this.pagination, this.buildSearch())
          )
          this.dataTableLoading = false
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.dataTableLoading = false
      }
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      }, 300)
    },
    async save() {
      const isValid = await this.$refs.observer.validate()
      if (isValid) {
        try {
          this.dataTableLoading = true
          // Updating item
          if (this.editedItem._id) {
            await this.updateDrop(this.editedItem)
            await this.getDrops(
              buildPayloadPagination(this.pagination, this.buildSearch())
            )
            this.dataTableLoading = false
          } else {
            // Creating new item
            await this.saveDrops({
              name: this.editedItem.name,
              amount: this.editedItem.amount,
              image: this.editedItem.image,
              sound: this.editItem.sound
            })
            console.log('Hi')
            await this.getDrops(
              buildPayloadPagination(this.pagination, this.buildSearch())
            )
            this.dataTableLoading = false
          }
          this.close()
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          this.dataTableLoading = false
          this.close()
        }
      }
    },
    async toggleDrops() {
      try {
        const result = await axios.post('/drops/handler', {
          enabled: !this.enabled
        })
        this.getHandler()
      } catch (err) {
        console.log(err)
      }
    },
    async saveInterval() {
      try {
        const result = await axios.post('/drops/handler', {
          interval: this.slider * 1000
        })
        this.getHandler()
        this.intervalDialog = false
      } catch (err) {
        console.log(err)
      }
    },
    async getHandler(init) {
      try {
        const { data } = await axios.get('/drops/handler')
        this.enabled = data.enabled
        this.odds = data.odds
        this.interval = data.interval

        if (init) {
          this.slider = this.interval / 1000
        }
      } catch (err) {
        console.log(err)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getHandler(true)

      this._interval = setInterval(() => {
        this.getHandler(true)
      }, 10000)
    })
  }
}
</script>

<style lang="scss">
.drops-wrapper {
  margin-top: 14px;
  max-width: 1344px;
}
table.v-table {
  max-width: none;
}
.status-text {
  color: $error;
  &.enabled {
    color: $success;
  }
}
</style>
