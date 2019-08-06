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

describe('Exact-Match Conflicts', () => {
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
      data.apiSandbox.getStub.withArgs('/api/v1/requests/queues/@me/oldest', sinon.match.any)
        .returns(new Promise((resolve) => resolve({ data: { nameRequest: 'NR1234' } })))
      data.apiSandbox.getStub.withArgs('/api/v1/requests/NR1234', sinon.match.any)
        .returns(new Promise((resolve) => {
          resolve({
            data: {
              names: [{ choice: 1, state: 'NE', name: 'incredible name inc' }],
              state: 'INPROGRESS',
              requestTypeCd: 'CR',
              applicants: '',
              nwpta: [],
              userId: 'Joe'
            }
          })
        }))
      data.apiSandbox.getStub.withArgs('/api/v1/requests/1', sinon.match.any)
        .returns(new Promise((resolve) => resolve({ data: {} })))
      data.apiSandbox.getStub.withArgs('/api/v1/exact-match?query=' + encodeURIComponent('incredible name inc'), sinon.match.any)
        .returns(new Promise((resolve) => resolve({
          data: {
            names: [{ name: 'INCREDIBLE NAME INC' }],
          }
        })))
      data.apiSandbox.getStub.withArgs('/api/v1/requests/synonymbucket/incredible name inc/*', sinon.match.any)
        .returns(new Promise((resolve) => {
          resolve({
            data: {
              names: [{
                name_info: { name: '----INCREDIBLE NAME INC - meta1' },
                stems: []
              }, {
                name_info: { name: '----INCREDIBLE NAME - meta2' },
                stems: []
              }, { name_info: { name: '----INCREDIBLE - meta3' }, stems: [] }, {
                name_info: {
                  id: "0693638", name: "INCREDIBLE STEPS RECORDS, INC.", score: 1.0, source: "CORP"
                }, stems: []
              }]
            }
          })
        }))
      data.apiSandbox.getStub.withArgs('/api/v1/requests/phonetics/incredible name inc/*', sinon.match.any)
        .returns(new Promise((resolve) => {
          resolve({
            data: {
              names: [{
                name_info: { name: '----INCREDIBLE NAME INC - meta1' }, stems: []
              }, {
                name_info: { name: '----INCREDIBLE NAME - meta2' }, stems: []
              }, { name_info: { name: '----INCREDIBLE - meta3' }, stems: [] }, {
                name_info: {
                  id: "0693638", name: "INCREDIBLE STEPS RECORDS, INC.", score: 1.0, source: "CORP"
                }, stems: []
              }]
            }
          })
        }))
      data.apiSandbox.getStub.withArgs('/api/v1/requests/cobrsphonetics/incredible name inc/*', sinon.match.any)
        .returns(new Promise((resolve) => {
          resolve({
            data: {
              names: [{
                name_info: { name: '----INCREDIBLE NAME INC' },
                stems: []
              }, {
                name_info: { name: '----INCREDIBLE NAME' },
                stems: []
              }, { name_info: { name: '----INCREDIBLE' }, stems: [] }, {
                name_info: {
                  id: "0793638", name: "INCREDYBLE STEPS RECORDS, INC.", score: 1.0, source: "CORP"
                }, stems: []
              }]
            }
          })
        }))
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

    it('displays exact-match conflicts', () => {
      expect(data.vm.$el.querySelector('#conflicts-container').innerHTML).toContain(
        'INCREDIBLE NAME INC'
      )
    })

    it('displays exact-match conflicts first (after title)', () => {
      expect(data.vm.$el.querySelector('#conflicts-container').innerHTML).toContain(
        'INCREDIBLE NAME INC'
      )

      // expect not to see spinner and results at the same time
      expect(data.vm.$el.querySelector('#conflicts-container .conflict-container-spinner').classList.contains('hidden'));
    })

    it('populates additional attributes as expected', () => {
      expect(data.instance.$store.state.exactMatchesConflicts).toEqual([
        {
          "class": "conflict-result conflict-exact-match",
          "highlightedText": "INCREDIBLE NAME INC",
          "id": "0-exact",
          "jurisdiction": undefined,
          "nrNumber": undefined,
          "source": undefined,
          "startDate": undefined,
          "text": "INCREDIBLE NAME INC"
        }
      ])
    })

    it('resists no exact match', (done) => {
      data.apiSandbox.getStub.withArgs('/api/v1/exact-match?query=' + encodeURIComponent('incredible name inc'), sinon.match.any).returns(
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
          // expect no-match messaging
          console.log(data.vm.$store.state.conflictsReturnedStatus)
          expect(data.vm.$el.querySelector('.conflict-no-match')).toBeDefined()
          // expect not to see spinner and no-match messaging at the same time
          expect(data.vm.$el.querySelector('#conflicts-container .conflict-container-spinner').classList.contains('hidden'));
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
          expect(document.getElementById('conflicts1').className).toContain('c-priority')
          done();
        }, 1000)
      }, 1000)
    })

    it('defaults to green', (done) => {
      data.apiSandbox.getStub.withArgs('/api/v1/exact-match?query=' + encodeURIComponent('incredible name inc'), sinon.match.any).returns(
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
          expect(document.getElementById('conflicts1').className).toContain('c-priority')
          done();
        }, 1000)
      }, 1000)
    })
  })
})
