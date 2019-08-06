/*eslint-disable*/
import staticFilesServer from '../static.files.server';
import {createApiSandbox, sinon} from '../../features/specs/support/api.stubs'
import Vue from 'vue';
import Vuelidate from 'vuelidate'
import Datatable from 'vue2-datatable-component'

Vue.use(Vuelidate)
Vue.use(require('vue-shortkey'))
Vue.use(Datatable)
import App from '@/App.vue';
import store from '@/store'
import router from '@/router'

describe('Synonym-Match Conflicts', () => {

  let data = {};

  beforeEach((done) => {
    data.apiSandbox = createApiSandbox()
    jest.setTimeout(100000);
    staticFilesServer.start(done)
  })
  afterEach((done) => {
    data.apiSandbox.restore()
    staticFilesServer.stop(done)
  })

  describe('list', () => {

    beforeEach((done) => {

      data.apiSandbox.getStub.withArgs('/api/v1/requests/queues/@me/oldest', sinon.match.any).returns(
        new Promise((resolve) => resolve({data: {nameRequest: 'NR1234'}}))
      )
      data.apiSandbox.getStub.withArgs('/api/v1/requests/NR1234', sinon.match.any).returns(
        new Promise((resolve) => {
          resolve({
            data: {
              names: [
                {choice: 1, state: 'NE', name: 'incredible name inc'}
              ],
              state: 'INPROGRESS',
              requestTypeCd: 'CR',
              applicants: '',
              nwpta: [],
              userId: 'Joe'
            }
          })
        })
      )
      data.apiSandbox.getStub.withArgs('/api/v1/requests/1', sinon.match.any).returns(
        new Promise((resolve) => resolve({data: {}}))
      )
      data.apiSandbox.getStub.withArgs('/api/v1/exact-match?query=' + encodeURIComponent('incredible name inc'), sinon.match.any).returns(
        new Promise((resolve) => resolve({
          data: {
            names: [{name: 'fake exact match'}],
          }
        }))
      )
      data.apiSandbox.getStub.withArgs('/api/v1/requests/synonymbucket/incredible name inc/*', sinon.match.any).returns(
        new Promise((resolve) => {
          resolve({
            data: {
              names: [
                {name_info: {name: '----INCREDIBLE NAME BLA* - meta1'}, stems: []},
                {name_info: {name: '----INCREDIBLE NAME* - meta2'}, stems: []},
                {name_info: {name: '----INCREDIBLE* - meta3'}, stems: []},
                {
                  name_info: {
                    id: "0793638",
                    name: "INCREDIBLE STEPS RECORDS, INC.",
                    score: 1.0,
                    source: "CORP"
                  }, stems: []
                }
              ]
            }
          })
        })
      )
      const Constructor = Vue.extend(App);
      data.instance = new Constructor({store: store, router: router});
      data.vm = data.instance.$mount(document.getElementById('app'));
      setTimeout(() => {
        data.instance.$store.state.userId = 'Joe'
        sessionStorage.setItem('AUTHORIZED', true)
        router.push('/nameExamination')
        setTimeout(() => {
          done();
        }, 1000)
      }, 1000)
    })

    it('displays synonym-match conflicts', () => {
      data.vm.$store.state.conflictsReturnedStatus = true
      data.vm.$nextTick(function(){
        expect(data.vm.$el.querySelector('#conflicts-container').innerHTML)
          .toContain('INCREDIBLE' + ' STEPS RECORDS, INC.')
  
        // expect not to see spinner and results at the same time
        expect(data.vm.$el.querySelector('#conflicts-container .conflict-container-spinner')
          .classList
          .contains('hidden'));
      })
    })

    it('displays synonym-match conflicts after exact match list', () => {
      data.vm.$store.state.conflictsReturnedStatus = true
      data.vm.$nextTick(function () {
        var content = data.vm.$el.querySelector('#conflicts-container').textContent.trim()
        expect(content.indexOf('fake exact match')).not.toEqual(-1)
        expect(content.indexOf('Synonym Match')).not.toEqual(-1)
        expect(content.indexOf('fake exact match') < content.indexOf('Synonym Match')).toEqual(true)
      })
    })

    it('populates additional attributes as expected', () => {
      expect(data.instance.$store.state.synonymMatchesConflicts).toEqual([{
          "children": [],
          "class": "conflict-synonym-title",
          "count": 0,
          "highlightedText": "INCREDIBLE NAME BLA*",
          "id": "0-synonym",
          "jurisdiction": undefined,
          "meta": "meta1",
          "nrNumber": undefined,
          "source": undefined,
          "startDate": undefined,
          "text": "INCREDIBLE NAME BLA*"
        }, {
          "children": [],
          "class": "conflict-synonym-title",
          "count": 0,
          "highlightedText": "INCREDIBLE NAME*",
          "id": "1-synonym",
          "jurisdiction": undefined,
          "meta": "meta2",
          "nrNumber": undefined,
          "source": undefined,
          "startDate": undefined,
          "text": "INCREDIBLE NAME*"
        }, {
          "children": [{
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "INCREDIBLE STEPS RECORDS, INC.",
            "id": "3-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0793638",
            "source": "CORP",
            "startDate": undefined,
            "text": "INCREDIBLE STEPS RECORDS, INC."
          }],
          "class": "conflict-synonym-title",
          "count": 1,
          "highlightedText": "INCREDIBLE*",
          "id": "2-synonym",
          "jurisdiction": undefined,
          "meta": "meta3",
          "nrNumber": undefined,
          "source": undefined,
          "startDate": undefined,
          "text": "INCREDIBLE*"
        }, {
          "class": "conflict-result",
          "count": 0,
          "highlightedText": "INCREDIBLE STEPS RECORDS, INC.",
          "id": "3-synonym",
          "jurisdiction": undefined,
          "meta": undefined,
          "nrNumber": "0793638",
          "source": "CORP",
          "startDate": undefined,
          "text": "INCREDIBLE STEPS RECORDS, INC."
        }]
      )
    })

    it('highlights the stems properly', (done) => {
      data.apiSandbox.getStub.withArgs('/api/v1/requests/synonymbucket/incredible name inc/*', sinon.match.any).returns(
        new Promise((resolve) => resolve({
          data: {
            names: [
              {
                name_info: {name: '----PACIFIC LUMBER CONSTRUCTION - meta1'},
                stems: ['pacif', 'lumb', 'construct']
              },
              {
                name_info: {
                  id: "0193638",
                  name: "PACIFIC LUMBER DEVELOPMENTS",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'lumb', 'develop']
              },
              {
                name_info: {
                  id: "0293638",
                  name: "PACIFIC LOG CONSTRUCTION",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'log', 'construct']
              },
              {
                name_info: {
                  id: "0393638",
                  name: "PACIFIC LOG RENOVATIONS",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'log', 'reno']
              },
              {
                name_info: {name: '----PACIFIC LUMBER (CONSTRUCTION) - meta2'},
                stems: ['pacif', 'lumb']
              },
              {
                name_info: {
                  id: "0493638",
                  name: "PACIFIC LUMBER WORD1 WORD2 WORD3 WORD4 RENOVATIONS",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'lumb', 'reno']
              },
              {name_info: {name: '----PACIFIC (LUMBER, CONSTRUCTION) - meta3'}, stems: ['pacif']},
              {
                name_info: {
                  id: "0593638",
                  name: "PACIFIC WORD1 WORD2 WORD3 WORD4 LUMBER RENOVATIONS",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'lumb', 'reno']
              },
            ]
          }
        }))
      )
      const Constructor = Vue.extend(App);
      data.instance = new Constructor({store: store, router: router});
      data.vm = data.instance.$mount(document.getElementById('app'));
      setTimeout(() => {
        data.instance.$store.state.userId = 'Joe'
        sessionStorage.setItem('AUTHORIZED', true)
        router.push('/nameExamination')
        setTimeout(() => {
          expect(data.instance.$store.state.synonymMatchesConflicts).toEqual([{
            "children": [{
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> LUMB</span></span>ER<span class=\"synonym-stem-highlight\"> DEVELOP</span>MENTS",
              "id": "1-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0193638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC LUMBER DEVELOPMENTS"
            }, {
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"synonym-stem-highlight\"> LOG</span><span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> CONSTRUCT</span></span>ION",
              "id": "2-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0293638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC LOG CONSTRUCTION"
            }, {
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"synonym-stem-highlight\"> LOG</span><span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
              "id": "3-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0393638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC LOG RENOVATIONS"
            }],
            "class": "conflict-synonym-title",
            "count": 3,
            "highlightedText": "<span class=\"stem-highlight\"> PACIF</span>IC<span class=\"stem-highlight\"> LUMB</span>ER<span class=\"stem-highlight\"> CONSTRUCT</span>ION",
            "id": "0-synonym",
            "jurisdiction": undefined,
            "meta": "meta1",
            "nrNumber": undefined,
            "source": undefined,
            "startDate": undefined,
            "text": "PACIFIC LUMBER CONSTRUCTION"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> LUMB</span></span>ER<span class=\"synonym-stem-highlight\"> DEVELOP</span>MENTS",
            "id": "1-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0193638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC LUMBER DEVELOPMENTS"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"synonym-stem-highlight\"> LOG</span><span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> CONSTRUCT</span></span>ION",
            "id": "2-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0293638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC LOG CONSTRUCTION"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"synonym-stem-highlight\"> LOG</span><span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
            "id": "3-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0393638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC LOG RENOVATIONS"
          }, {
            "children": [{
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> LUMB</span></span>ER WORD1 WORD2 WORD3 WORD4<span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
              "id": "5-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0493638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC LUMBER WORD1 WORD2 WORD3 WORD4 RENOVATIONS"
            }],
            "class": "conflict-synonym-title",
            "count": 1,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"> LUMB</span>ER (CONSTRUCTION)",
            "id": "4-synonym",
            "jurisdiction": undefined,
            "meta": "meta2",
            "nrNumber": undefined,
            "source": undefined,
            "startDate": undefined,
            "text": "PACIFIC LUMBER (CONSTRUCTION)"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> LUMB</span></span>ER WORD1 WORD2 WORD3 WORD4<span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
            "id": "5-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0493638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC LUMBER WORD1 WORD2 WORD3 WORD4 RENOVATIONS"
          }, {
            "children": [{
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC WORD1 WORD2 WORD3 WORD4<span class=\"synonym-stem-highlight\"> LUMB</span>ER<span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
              "id": "7-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0593638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC WORD1 WORD2 WORD3 WORD4 LUMBER RENOVATIONS"
            }],
            "class": "conflict-synonym-title",
            "count": 1,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC (LUMBER, CONSTRUCTION)",
            "id": "6-synonym",
            "jurisdiction": undefined,
            "meta": "meta3",
            "nrNumber": undefined,
            "source": undefined,
            "startDate": undefined,
            "text": "PACIFIC (LUMBER, CONSTRUCTION)"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC WORD1 WORD2 WORD3 WORD4<span class=\"synonym-stem-highlight\"> LUMB</span>ER<span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
            "id": "7-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0593638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC WORD1 WORD2 WORD3 WORD4 LUMBER RENOVATIONS"
          }
          ])
          done();
        }, 1000)
      }, 1000)
    })

    it('handles unexpected/incorrect syn and stem data properly', (done) => {
      data.apiSandbox.getStub.withArgs('/api/v1/requests/synonymbucket/incredible name inc/*', sinon.match.any).returns(
        new Promise((resolve) => resolve({
          data: {
            names: [
              {
                name_info: {name: '----PACIFIC LUMBER CONSTRUCTION - meta1'},
                stems: ['pacif', 'lumb', 'construct', '']
              },
              {
                name_info: {
                  id: "0193638",
                  name: "PACIFIC LUMBER DEVELOPMENTS",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'lumb', 'develop', '']
              },
              {
                name_info: {
                  id: "0293638",
                  name: "PACIFIC LOG CONSTRUCTION",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'log', 'construct']
              },
              {
                name_info: {
                  id: "0393638",
                  name: "PACIFIC LOG RENOVATIONS",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'log', 'reno']
              },
              {
                name_info: {name: '----PACIFIC LUMBER (CONSTRUCTION) - meta2'},
                stems: ['pacif', 'lumb', '', '']
              },
              {
                name_info: {
                  id: "0493638",
                  name: "PACIFIC LUMBER WORD1 WORD2 WORD3 WORD4 RENOVATIONS",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'lumb', 'reno', '', ' ']
              },
              {name_info: {name: '----PACIFIC (LUMBER, CONSTRUCTION) - meta3'}, stems: ['pacif']},
              {
                name_info: {
                  id: "0593638",
                  name: "PACIFIC WORD1 WORD2 WORD3 WORD4 LUMBER RENOVATIONS",
                  score: 1.0,
                  source: "CORP"
                }, stems: ['pacif', 'lumb', 'reno']
              },
            ]
          }
        }))
      )
      const Constructor = Vue.extend(App);
      data.instance = new Constructor({store: store, router: router});
      data.vm = data.instance.$mount(document.getElementById('app'));
      setTimeout(() => {
        data.instance.$store.state.userId = 'Joe'
        sessionStorage.setItem('AUTHORIZED', true)
        router.push('/nameExamination')
        setTimeout(() => {
          expect(data.instance.$store.state.synonymMatchesConflicts).toEqual([{
            "children": [{
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> LUMB</span></span>ER<span class=\"synonym-stem-highlight\"> DEVELOP</span>MENTS",
              "id": "1-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0193638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC LUMBER DEVELOPMENTS"
            }, {
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"synonym-stem-highlight\"> LOG</span><span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> CONSTRUCT</span></span>ION",
              "id": "2-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0293638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC LOG CONSTRUCTION"
            }, {
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"synonym-stem-highlight\"> LOG</span><span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
              "id": "3-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0393638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC LOG RENOVATIONS"
            }],
            "class": "conflict-synonym-title",
            "count": 3,
            "highlightedText": "<span class=\"stem-highlight\"> PACIF</span>IC<span class=\"stem-highlight\"> LUMB</span>ER<span class=\"stem-highlight\"> CONSTRUCT</span>ION",
            "id": "0-synonym",
            "jurisdiction": undefined,
            "meta": "meta1",
            "nrNumber": undefined,
            "source": undefined,
            "startDate": undefined,
            "text": "PACIFIC LUMBER CONSTRUCTION"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> LUMB</span></span>ER<span class=\"synonym-stem-highlight\"> DEVELOP</span>MENTS",
            "id": "1-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0193638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC LUMBER DEVELOPMENTS"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"synonym-stem-highlight\"> LOG</span><span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> CONSTRUCT</span></span>ION",
            "id": "2-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0293638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC LOG CONSTRUCTION"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"synonym-stem-highlight\"> LOG</span><span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
            "id": "3-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0393638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC LOG RENOVATIONS"
          }, {
            "children": [{
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> LUMB</span></span>ER WORD1 WORD2 WORD3 WORD4<span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
              "id": "5-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0493638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC LUMBER WORD1 WORD2 WORD3 WORD4 RENOVATIONS"
            }],
            "class": "conflict-synonym-title",
            "count": 1,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"> LUMB</span>ER (CONSTRUCTION)",
            "id": "4-synonym",
            "jurisdiction": undefined,
            "meta": "meta2",
            "nrNumber": undefined,
            "source": undefined,
            "startDate": undefined,
            "text": "PACIFIC LUMBER (CONSTRUCTION)"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> LUMB</span></span>ER WORD1 WORD2 WORD3 WORD4<span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
            "id": "5-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0493638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC LUMBER WORD1 WORD2 WORD3 WORD4 RENOVATIONS"
          }, {
            "children": [{
              "class": "conflict-result",
              "count": 0,
              "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC WORD1 WORD2 WORD3 WORD4<span class=\"synonym-stem-highlight\"> LUMB</span>ER<span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
              "id": "7-synonym",
              "jurisdiction": undefined,
              "meta": undefined,
              "nrNumber": "0593638",
              "source": "CORP",
              "startDate": undefined,
              "text": "PACIFIC WORD1 WORD2 WORD3 WORD4 LUMBER RENOVATIONS"
            }],
            "class": "conflict-synonym-title",
            "count": 1,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC (LUMBER, CONSTRUCTION)",
            "id": "6-synonym",
            "jurisdiction": undefined,
            "meta": "meta3",
            "nrNumber": undefined,
            "source": undefined,
            "startDate": undefined,
            "text": "PACIFIC (LUMBER, CONSTRUCTION)"
          }, {
            "class": "conflict-result",
            "count": 0,
            "highlightedText": "<span class=\"stem-highlight\"><span class=\"synonym-stem-highlight\"> PACIF</span></span>IC WORD1 WORD2 WORD3 WORD4<span class=\"synonym-stem-highlight\"> LUMB</span>ER<span class=\"synonym-stem-highlight\"> RENO</span>VATIONS",
            "id": "7-synonym",
            "jurisdiction": undefined,
            "meta": undefined,
            "nrNumber": "0593638",
            "source": "CORP",
            "startDate": undefined,
            "text": "PACIFIC WORD1 WORD2 WORD3 WORD4 LUMBER RENOVATIONS"
          }
          ])
          done();
        }, 1000)
      }, 1000)
    })

    it('changes conflicts tab to red', (done) => {
      const Constructor = Vue.extend(App);
      data.instance = new Constructor({store: store, router: router});
      data.vm = data.instance.$mount(document.getElementById('app'));
      setTimeout(() => {
        data.instance.$store.state.userId = 'Joe'
        sessionStorage.setItem('AUTHORIZED', true)
        router.push('/nameExamination')
        setTimeout(() => {
          expect(document.getElementById('conflicts1').className).toMatch('c-priority')
          done();
        }, 1000)
      }, 1000)
    })

    it('defaults to green', (done) => {
      data.apiSandbox.getStub.withArgs('/api/v1/exact-match?query=' + encodeURIComponent('incredible name inc'), sinon.match.any).returns(
        new Promise((resolve) => resolve({
          data: {
            names: [],
          }
        }))
      )
      data.apiSandbox.postStub.withArgs('/api/v1/documents:conflicts', sinon.match.any).returns(
        new Promise((resolve) => resolve({
          data: {
            setConflicts: {},
            names: [],
            response: {}
          }
        }))
      )
      data.apiSandbox.getStub.withArgs('/api/v1/requests/synonymbucket/incredible name inc/*', sinon.match.any).returns(
        new Promise((resolve) => resolve({
          data: {
            names: []
          }
        }))
      )
      const Constructor = Vue.extend(App);
      data.instance = new Constructor({store: store, router: router});
      data.vm = data.instance.$mount(document.getElementById('app'));
      setTimeout(() => {
        data.instance.$store.state.userId = 'Joe'
        sessionStorage.setItem('AUTHORIZED', true)
        router.push('/nameExamination')
        setTimeout(() => {
          expect(document.getElementById('conflicts1').className).toMatch('c-accepted')
          done();
        }, 1000)
      }, 1000)
    })
  })
})
