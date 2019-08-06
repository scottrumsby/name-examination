/* eslint-disable */
import Vue from 'vue';
import store from '@/store'
import ConflictList from '@/components/application/examine/recipe/conflicts/ConflictList';

describe('ConflictList.vue cobrs phonetic matches expand/collapse', () => {

  let vm
  let data

  beforeEach(() => {
    const Constructor = Vue.extend(ConflictList);
    vm = new Constructor({store: store}).$mount();
    store.commit('setCobrsPhoneticConflicts', {
      names: [
        {name_info: {name: 'first title'}, stems: []},
        {name_info: {name: 'first match', source: 'CORP'}, stems: []},
        {name_info: {name: 'second title'}, stems: []},
        {name_info: {name: 'second match', source: 'CORP'}, stems: []},
        {name_info: {name: 'second match #2', source: 'CORP'}, stems: []},
        {name_info: {name: 'third title'}, stems: []},
        {name_info: {name: 'third match', source: 'CORP'}, stems: []},
        {name_info: {name: 'third match #2', source: 'CORP'}, stems: []},
      ]
    })
    data = vm.$store.getters.cobrsPhoneticConflicts
  })

  it('is available', () => {
    expect(data[2].class).toEqual('conflict-cobrs-phonetic-title')
    expect(data[3].class).toEqual('conflict-result')
    expect(data[4].class).toEqual('conflict-result')
  })
})
