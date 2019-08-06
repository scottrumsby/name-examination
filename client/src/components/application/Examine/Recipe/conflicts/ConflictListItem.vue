<template>
  <v-container fluid ma-0 pa-0 >
    <v-layout :conflict-highlighted="childIndex === n && focus === 'conflicts'"
              :id="child.id"
              wrap
              ma-0
              align-center
              pb-0
              pl-3>
      <v-flex shrink v-if="child.nrNumber">
        <v-checkbox style="position: relative; top:4px"
                    :disabled="!is_making_decision"
                    :value="child.nrNumber"
                    :input-value="selectedNRs"
                    @click.capture.stop.self="setCheckbox(child)"/>
      </v-flex>
      <v-flex lg7
              cursor-pointer
              @click="clickChild(child, n)"
              no-overflow
              v-html="child.highlightedText"/>
      <v-flex lg1
              cursor-pointer
              v-if="child.jurisdiction">{{ child.jurisdiction }}
      </v-flex>
      <v-flex lg1
              cursor-pointer
              v-if="child.nrNumber">{{ child.nrNumber }}
      </v-flex>
      <v-flex lg2
              pr-3
              cursor-pointer
              text-right
              v-if="child.startDate">{{ formatDate(child.startDate) }}
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex lg12 v-if="expandedID === child.id">
        <div>
          <ConflictInfo class="conflict-detail"/>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import ConflictInfo from './ConflictInfo'
  import moment from 'moment'
  import spinner from '../../../spinner'

  export default {
    name: 'ConflictListItem',
    components: { spinner, ConflictInfo },
    props: [
      'child',
      'childIndex',
      'clickChild',
      'expandedID',
      'focus',
      'id',
      'is_making_decision',
      'n',
      'selectedNRs',
      'setCheckbox',
    ],
    methods: {
      formatDate(d) {
        return moment(d).format('YYYY-MM-DD')
      },
    }
  }
</script>

<style scoped>
  .conflict-detail-spinner:not(.hidden) ~ .conflict-detail {
    display: none !important;
  }

  .no-overflow {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  .cursor-pointer, .title-match, .bucket-list {
    cursor: pointer !important;
  }

  .conflict-exact-match {
    color: var(--priority) !important;
    font-weight: 400;
  }

  .conflict-meta {
    text-transform: lowercase !important;
    font-weight: 400 !important;
    font-style: italic !important;
  }

  .conflict-result {
    color: #38598a;
    height: 32px !important;
  }

  .conflict-highlighted {
    background-color: #dceffa;
  }

  .shift-up {
    position: relative;
    top: -15px !important;
  }
</style>
