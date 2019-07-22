<!--eslint-disable-->
<template>
  <v-container fluid ma-0 pa-0>
    <spinner className="history-spinner hidden" />
    <v-layout id="history-list-view" ma-0 pa-0>
      <v-flex v-if="historiesJSON.length > 0">
        <v-data-table :headers="headers"
                      :items="historiesJSON"
                      class="conditions-table-style"
                      v-shortkey="{arrowup:['arrowup'],arrowdown:['arrowdown'],arrowright:['arrowright'],arrowleft:['arrowleft']}"
                      @shortkey.native="handleKeyboardEvent"
                      hide-actions>
          <template v-slot:items="{item, index}">
            <tr :active="ind === index"
                :id="item.nr_num"
                @click="setHistoryInfo(item, index)">
              <td class="text-xs-left history-item">{{ item.name }}</td>
              <td class="text-xs-left history-item">{{ item.jurisdiction }}</td>
              <td class="text-xs-left history-item">{{ item.nr_num }}</td>
              <td class="text-xs-left history-item">{{ formatDate(item.start_date) }}</td>
              <td class="text-xs-left history-item">
                <span class="fw-700" :style="setActiveStyle(item)" v-if="item.name_state_type_cd">
                  {{ item.name_state_type_cd }}
                </span>
              </td>
            </tr>
            <tr v-if="expandedInd === index">
              <td class="ma-0 pa-0" colspan="5">
                <HistoryInfo />
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
/* eslint-disable */
  import spinner from '@/components/application/spinner.vue';
import HistoryInfo from './HistoryInfo'
import moment from 'moment'

  export default {
    name: 'HistoryList',
    components: { HistoryInfo, spinner, },
    data() {
      return {
        headers: [
          { text: 'Name', value: 'name', align: 'left', sortable: false, },
          { text: 'Jurisdiction', value: 'jurisdiction', align: 'left', sortable: false, },
          { text: 'NR', value: 'nr_num', align: 'left', sortable: false, },
          { text: 'Consumed', value: 'startDate', align: 'left', sortable: false, },
          { text: 'Status', value: 'none', align: 'left', sortable: false, },
        ],
        expandedInd: null,
        ind: 0,
      }
    },
    mounted() {
      this.$nextTick(function() {
        if (this.historiesJSON && this.historiesJSON.length > 0) {
          this.ind = 0
          this.expandedInd = null
          if (this.historiesJSON.length === 1) {
            this.currentHistory = this.historiesJSON[0]
          }
        }
      })
    },
    computed: {
      historiesJSON() {
        if (this.$store.getters.historiesJSON && this.$store.getters.historiesJSON.names) {
          return this.$store.getters.historiesJSON.names;
        } else {
          return []
        }
      },
      activeNR() {
        if (this.ind !== null && this.historiesJSON && this.historiesJSON.length > 0) {
          return this.historiesJSON[this.ind].nr_num
        }
        return ''
      },
      currentNrNum() {
        if (this.currentHistory && this.currentHistory.nr_num) return this.currentHistory.nr_num
        return null
      },
      currentHistory: {
        get() {
          if (this.$store.getters.currentHistory) return this.$store.getters.currentHistory
          return null
        },
        set(item) {
          this.$store.commit('currentHistory', item)
        }
      },
    },
    methods: {
      formatDate(timestamp) {
        return moment(timestamp).format('YYYY-MM-DD')
      },
      setActiveStyle(item) {
        if (item.name_state_type_cd === 'A')   return { color: 'var(--accepted)' }
        if ( item.name_state_type_cd === 'C' ) return { color: 'var(--gold)'  }
        if ( item.name_state_type_cd === 'R' ) return { color: 'var(--rejected)'   }
      },
      setHistoryInfo(item, index) {
        if (this.currentNrNum && item.nr_num == this.currentNrNum) {
          this.currentHistory = ''
          this.ind = index
          this.$store.dispatch('resetHistoriesInfo')
          return
        }
        this.currentHistory = item
        this.ind = index
        this.$store.dispatch('resetHistoriesInfo')
        this.$store.dispatch('getHistoryInfo', item)
      },
      handleKeyboardEvent(event) {
        const scrollToView = (index) => {
          let id = this.historiesJSON[index].nr_num
          let el = document.getElementById(id)
          if (el) {
            el.scrollIntoViewIfNeeded()
          }
        }
        let keyPresses = ['arrowup', 'arrowdown', 'arrowright', 'arrowleft']
        if (!event.isComposing && keyPresses.includes(event.srcKey)) {
          event.preventDefault()

          if (this.historiesJSON && this.historiesJSON.length > 0) {
            let length = this.historiesJSON.length
            switch (event.srcKey) {
              case 'arrowdown':
                if (this.currentHistory) { this.currentHistory = null }
                if (this.expandedInd) { this.expandedInd = null }
                if (this.ind === null) {
                  this.ind = 0
                  scrollToView(this.ind)
                  return
                }
                if (this.ind === (length - 1)) return
                this.ind++
                scrollToView(this.ind)
                return

              case 'arrowup':
                if (this.currentHistory) { this.currentHistory = null }
                if (this.expandedInd) { this.expandedInd = null }
                if (this.ind === null || this.ind <= 0) {
                  this.ind = 0
                  scrollToView(this.ind)
                  return
                }
                this.ind--
                scrollToView(this.ind)
                return

              case 'arrowright':
                if (this.ind === null) {
                  this.ind = 0
                }
                this.expandedInd = this.ind
                this.currentHistory = this.historiesJSON[this.ind]
                this.$store.dispatch('resetHistoriesInfo')
                this.$store.dispatch('getHistoryInfo', this.currentHistory)
                return

              case 'arrowleft':
                this.expandedInd = null
                this.currentHistory = null
                return
            }
          }
        }
      }
    },
  }
</script>

<style scoped>
  .history-spinner:not(.hidden) ~ #history-list-view {
    display: none;
  }

  .history-list-view option {
    padding: 5px;
  }

  tr {
    cursor: pointer !important;
  }

</style>
