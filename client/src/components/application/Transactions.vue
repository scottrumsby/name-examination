<template>
  <div class="transactions-modal-area" id="transactions-modal-area" @click.self="closeModal()">
    <v-container id="transactions-modal"
                 fluid
                 class="transactions-modal"
                 :class="maximized ? 'transactions-modal-lg' : 'transactions-modal-sm'"
                 pa-0>
      <template v-if="!showTransactionsModalSpinner">
        <v-layout v-dragged="onDrag">
          <v-flex title-font grow>Transaction History</v-flex>
          <v-flex title-font shrink>
            <v-icon class="min-max-icon" @click="maximized = !maximized">
              {{ maximized ? 'remove_circle' : 'add_circle' }}
            </v-icon>
            <v-icon class="close-icon" @click="closeModal()">
              add_circle
            </v-icon>
          </v-flex>
        </v-layout>
        <v-layout grey-bar>
          <v-flex fs-16-fw-700 grow>History for {{ nrNumber }}</v-flex>
          <v-flex shrink>as at {{ timeStamp }}</v-flex>
        </v-layout>
        <v-layout>
          <v-flex>
            <v-data-table :headers="headers"
                          :items="sortedTransactionData"
                          rows-per-page-text=""
                          class="ma-2">
              <template v-slot:headers="{ headers }">
                <tr class="text-left">
                  <th v-for="(header, i) in headers"
                      class="text-left"
                      :style="header.style">
                    {{ header.text }}
                  </th>
                </tr>
              </template>
              <template v-slot:items="{item, index}">
                <tr :key="'trans-row'+index" :class="expand === index ? 'bg-xl-blue' : ''">
                  <td>{{ item.user_action ? item.user_action : item.action }}</td>
                  <td>{{ item.user_name }}</td>
                  <td :colspan="item.showJSONData ? 1 : 2">{{ parseDate(item.eventDate) }}</td>
                  <td v-if="item.showJSONData">
                    <v-icon class="plus-icon"
                            v-if="expand !== index"
                            @click="expand = index">keyboard_arrow_down
                    </v-icon>
                    <v-icon class="plus-icon"
                            v-else
                            @click="expand = null">keyboard_arrow_up
                    </v-icon>
                  </td>
                </tr>
                <tr v-if="expand === index"
                    class="bg-xl-blue ma-0 pa-0">
                  <td colspan="5" class="ma-0 pa-0">
                    <TransactionsExpansionRow :jsonData="item.jsonData" />
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </template>
      <template v-if="showTransactionsModalSpinner">
        <v-layout mb-5 pb-3>
          <spinner />
        </v-layout>
      </template>
    </v-container>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import moment from 'moment'
  import Spinner from './spinner'
  import TransactionsExpansionRow from './TransactionsExpansionRow'

  export default {
    name: 'Transactions',
    components: { TransactionsExpansionRow, Spinner },
    data() {
      return {
        expand: null,
        dragged: false,
        maximized: true,
        headers: [
          { text: 'Transaction', style: { width: '50%' } },
          { text: 'Username', style: { width: '25%' } },
          { text: 'Date & Time', style: { width: '10%' } },
          { text: 'Expand', style: { width:'5%' } },
        ],
        showSpinner: true,
        timeStamp: '',
      }
    },
    mounted() {
      this.timeStamp = moment().format('YYYY-MM-DD, h:mm a')
      /*this.$nextTick(function() {
        document.removeEventListener('click', this.handleDismissClick)
        document.addEventListener('click', this.handleDismissClick)
      })*/
    },
    computed: {
      ...mapGetters(['nrNumber']),
      ...mapState([
        'transactionsData',
        'transactionsNR',
        'transactionsModalVisible',
        'showTransactionsModalSpinner'
      ]),
      sortedTransactionData() {
        if (Array.isArray(this.transactionsData)) {
          let output = this.transactionsData.sort((a,b) => {
            let A = moment(a.eventDate).format('x')
            let B = moment(b.eventDate).format('x')
            if (A > B) return -1
            if (A < B) return 1
            return 0
          })
          return output.filter(item => item.user_action || item.action)
        }
        return []
      }
    },
    methods: {
      handleDismissClick(event) {
        if (!this.transactionsModalVisible) return event
        if ( event.path.some(el => el === this.$el) ) {
          return event
        }
        this.closeModal()
      },
      closeModal() {
        this.$store.commit('toggleTransactionsModal', false)
        this.$store.commit('setTransactionsData', [])
        this.$store.commit('toggleTransactionsSpinner', true)
      },
      parseDate(date) {
        return moment(date).local().format('YYYY-MM-DD, h:mm a')
      },
      getTransactions() {
        this.$store.dispatch('getTransactionsHistory', this.nrNumber).then( () => {
          this.showSpinner = false
        })
      },
      customSort(items, index, isDescending) {
        return items.sort((a,b) => {
          let A = moment(a.eventDate).format('x')
          let B = moment(b.eventDate).format('x')
          if (A > B) return -1
          if (A < B) return 1
          return 0
        })
      },
      onDrag({ deltaX, deltaY, offsetX, offsetY, clientX, clientY, first, last }) {
        let el = document.getElementById('transactions-modal')
        if ( first ) {
          this.dragged = true
          return
        }
        if (last) {
          this.dragged = false
          return
        }
        let l = +window.getComputedStyle(el)['left'].slice(0, -2) || 0
        let t = +window.getComputedStyle(el)['top'].slice(0, -2) || 0
        el.style.left = l + deltaX + 'px'
        el.style.top = t + deltaY + 'px'
      }
    }
  }
</script>

<style>
  #transactions-modal > div:nth-child(3) > div > div > div.v-datatable.v-table.theme--light > div >
  div.v-datatable__actions__select > div {
    display: none !important;
  }
</style>

<style scoped>


  .arrow-icon {
    color: var(--link);
    font-size: 22px;
    cursor: pointer;
  }

  .close-icon {
    color: var(--priority);
    transform: rotate(45deg);
    font-size: 26px;
  }
  .grey-bar {
    color: var(--text);
    padding: 10px;
    background-color: var(--xl-grey);
  }

  .min-max-icon {
    color: var(--link);
    font-size: 26px;
  }

  .title-font {
    font-size: 24px;
    font-weight: 600;
    margin: 8px;
  }

  .transactions-modal-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99999;
  }

  .transactions-modal {
    position: absolute;
    top: 200px;
    background-color: white;
    box-shadow: 0px 0px 20px 4px grey;
    z-index: 9999;
    overflow-y: auto;
  }


  .transactions-modal-lg {
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    max-height: 800px;
  }

  tr:hover:not(.bg-xl-blue) {
    background-color: unset !important;
  }

  .bg-xl-blue {
    background-color: var(--xl-blue) !important;
  }

  .transactions-modal-sm {
    width: 60%;
    margin-left: 20%;
    margin-right: 20%;
    max-height: 400px;
  }

</style>
