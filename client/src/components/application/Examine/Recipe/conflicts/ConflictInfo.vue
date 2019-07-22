/* eslint-disable */
<template>
  <v-container ma-0 pa-0 fluid bg-color>
    <v-layout>
      <spinner className="conflict-detail-spinner hidden pb-5"/>
      <CorpMatch id="corpmatch" class="conflict-info-view" v-if="is_corp"/>
      <NamesMatch id="namematch" class="conflict-info-view" v-else-if="is_names"/>
      <NullMatch class="conflict-info-view" v-else/>
    </v-layout>
  </v-container>
</template>

<script>
/* eslint-disable */
  import CorpMatch from './conflictInfoType/CorpMatch.vue'
  import NamesMatch from './conflictInfoType/NamesMatch.vue'
  import NullMatch from './conflictInfoType/NullMatch.vue'
  import spinner from '@/components/application/spinner.vue'

  export default {
    name: 'ConflictInfo',
    components: { CorpMatch, NamesMatch, NullMatch, spinner, },
    mounted() {
      let el = document.getElementById('corpmatch') ?
        document.getElementById('corpmatch') : document.getElementById('namematch')
      if (el) {
        el.scrollIntoViewIfNeeded()
      }
    },
    computed: {
      currentConflict() {
        return this.$store.getters.currentConflict
      },
      is_corp() {
        if (this.currentConflict != undefined) {
          if (this.currentConflict.source === 'CORP') return true
        }
        return false
      },
      is_names() {
        if (this.currentConflict != undefined) {
          if (this.currentConflict.source === 'NR') return true
        }
        return false
      },
    },
  }
</script>

<style scoped>
  .conflict-detail-spinner:not(.hidden) ~ .conflict-info-view {
    display: none !important;
  }
  .bg-color {
    background-color: var(--xl-cyan);
  }

</style>
