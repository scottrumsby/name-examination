/* eslint-disable */

<template>
  <fragment>
    <v-container fluid ma-0 pa-0>
      <v-layout align-start mb-3 row>
        <v-flex :class="['nr-number', 'text-left',  'mx-4', priority ? 'rejected' : 'dk-grey']" shrink>
          {{ nrNumber }}
        </v-flex>
        <v-flex grow v-if="!is_editing || is_closed" request-type>{{ requestType_desc }}</v-flex>
        <v-flex lg4 v-else>
          <v-layout column>
            <v-flex mt-2 :ripple="false">
              <v-select :items="requestType_options"
                        class="jurisdiction-dropdown"
                        flat
                        dense
                        :ripple="false"
                        v-model="requestType"></v-select>
            </v-flex>
            <v-flex v-if="!is_editing || is_closed"
                    style="font-weight: bold;">{{ jurisdiction }}</v-flex>
            <v-flex v-else-if="jurisdiction_required"
                    :class="{'form-group-error': $v.jurisdiction.$error}">
              <v-layout column>
                <v-flex fw-600 fs-15 mt-2 :ripple="false">Jurisdiction:</v-flex>
                <v-flex :mb-2="!$v.jurisdiction.required">
                  <v-select v-model="jurisdiction"
                            :items="jurisdiction_options"
                            class="jurisdiction-dropdown"
                            flat
                            dense
                            :ripple="false"
                            @input="$v.jurisdiction.$touch()" />
                </v-flex>
                <v-flex mb-2 field-error v-if="!$v.jurisdiction.required">Jurisdiction is required</v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex shrink mr-4 v-if="!is_editing" align-self-center>
          <actions-buttons :edit="edit"
                           :is_viewing="is_viewing"
                           :toggleDetails="toggleDetails"
                           :can_edit="can_edit"/>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid ma-0 pa-0
                 id="header-info-banner"
                 :class="is_expanded ? 'info-banner-xpanded' : 'info-banner-collapsed'"
                 :fill-height="is_expanded">
      <!-- 1ST ROW: BANNER AND EDIT MODE FORM FIELDS -->
      <v-layout align-start
                :fill-height="is_expanded"
                pa-0 ma-0>

        <!--Priority/Status/Comments -->
        <v-flex fs-15 shrink ml-4 ml-2 >
          <v-layout column>
            <v-flex priority fw-700 v-if="priority"><v-icon class="priority fs-18">star</v-icon>Priority</v-flex>
            <v-flex><b>Status:</b> {{ nr_status }} {{ is_approved_expired ? '-EXPIRED' : '' }}</v-flex>
            <v-flex><b>Examiner:</b> {{ examiner }}</v-flex>
            <v-flex>
              <v-icon color="light-blue"
                      class="mirrored"
                      @click="toggleCommentsPopUp(true)">chat_bubble_outline</v-icon>
              <b class="dark-blue--text">
                {{ internalComments_length }} Comments</b>
            </v-flex>
          </v-layout>
        </v-flex>

        <v-flex shrink mx-2 style="height: 100px" v-if="!is_expanded">
          <v-divider vertical/>
        </v-flex>

        <!-- Dates/Expiry -->
        <v-flex shrink fs-15 :ml-2="is_expanded">
          <v-layout column>
            <v-flex><b>Submission:</b> {{ submittedDate }}</v-flex>
            <v-flex :class="!$store.getters.decision_made ? 'grey--text' : ''">
              <b>Decision:</b> {{ $store.getters.decision_made ? $store.getters.decision_made : 'n/a' }}
            </v-flex>
            <v-flex :class="!$store.getters.decision_made ? 'grey--text' : ''">
              <b>Corp Num:</b> {{ corpNum ? corpNum : 'n/a' }}
            </v-flex>
            <v-flex v-if="expiryDate !== null">
              <v-layout column>
                <v-flex v-if="!is_editing && expiryDateForEdit != null"><b>Expiry: </b>{{ expiryDateForEdit }}</v-flex>
                <v-flex v-else-if="!is_editing"><b>Expiry: </b>{{ expiryDate }}</v-flex>
                <v-flex v-else>
                  <v-layout column :class="{'form-group-error': $v.expiryDateForEdit.$error}">
                    <v-flex><v-text-field v-model="expiryDateForEdit"
                                          placeholder="Expiry Date"
                                          :onchange="$v.expiryDateForEdit.$touch()" /></v-flex>
                    <v-flex>DD-MM-YYYY</v-flex>
                    <v-flex v-if="!$v.expiryDateForEdit.required">Expiry Date is required.</v-flex>
                    <v-flex class="error" v-if="!$v.expiryDateForEdit.isValidFormat">
                      Date must be in format DD-MM-YYYY.
                    </v-flex>
                    <v-flex class="error" v-else-if="!$v.expiryDateForEdit.isActualDate">
                      This is not an actual date. Date must be in format DD-MM-YYYY.
                    </v-flex>
                    <v-flex class="error" v-if="!$v.expiryDateForEdit.isFutureDate">
                      Expiry Date must be in the future.
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex v-else class="grey--text"><b>Expiry:</b> n/a</v-flex>
            <v-flex :class="!consumptionDate ? 'grey--text' : ''">
              <b>Consumed:</b> {{ consumptionDate ? consumptionDate : 'n/a' }}
            </v-flex>
            <v-flex grey--text>Consent: n/a</v-flex>
          </v-layout>
        </v-flex>

        <v-flex shrink mx-2 style="height: 100px" v-if="!is_expanded">
          <v-divider vertical/>
        </v-flex>
        <!--NWPTA  AB /  SK -->
        <v-flex :ml-2="is_expanded" fs-15 grow :style="is_expanded ? {maxWidth: '150px'} : ''">
          <v-layout column id="nwpta-ab">
            <nwpta ref="nwpta_ab"
                   jurisdiction="AB"
                   :is_lp_nwpta_type="is_lp_nwpta_type"
                   :is_cp_nwpta_type="is_cp_nwpta_type"/>
          </v-layout>
        </v-flex>
        <v-flex fs-15 grow :style="is_expanded ? {maxWidth: '150px'} : ''">
          <v-layout column id="nwpta-sk">
            <nwpta ref="nwpta_sk"
                   jurisdiction="SK"
                   :is_lp_nwpta_type="is_lp_nwpta_type"
                   :is_cp_nwpta_type="is_cp_nwpta_type"/>
          </v-layout>
        </v-flex>

        <v-flex shrink mx-2 style="height: 100px" v-if="!is_expanded">
          <v-divider vertical/>
        </v-flex>
        <!--ADDITIONAL INFORMATION -->
        <InfoHeaderPopup title="Additional Information:"
                         :class="is_editing ? 'ml-2' : ''"
                         infoType="information"
                         :is_editing="is_editing"
                         :is_viewing="is_viewing"
                         :is_expanded="is_expanded"
                         :save="save"
                         :text="additionalInfo"/>

        <v-flex shrink mx-3 style="height: 100px" v-if="!is_expanded">
          <v-divider vertical/>
        </v-flex>
        <!-- NATURE OF BUSINESS -->
        <InfoHeaderPopup title="Nature of Business:"
                         :class="is_editing ? 'ml-2' : ''"
                         :is_editing="is_editing"
                         :is_viewing="is_viewing"
                         :is_expanded="is_expanded"
                         infoType="nature"
                         :text="natureOfBusiness">
          <!--CONTENT HERE GOES IN SLOT UNDER NATURE OF BUSINESS-->
          <v-layout column>
            <v-flex mt-4 v-if="submitCount > 0"><b>Submit Count: </b>{{submitCount}}</v-flex>
            <template v-if="prev_nr_required">
              <v-layout column v-if="is_editing && !is_closed"
                        :class="{'form-group-error': $v.previousNr.$error}">
                <v-flex mt-4 fw-600>Previous NR</v-flex>
                <v-flex><v-text-field class="name-choice-input"
                                      v-model="previousNr"
                                      @input="$v.previousNr.$touch()" /></v-flex>
                <v-flex field-error v-if="!$v.previousNr.isValidNr">Please enter a valid NR ("NR xxxxxxx")</v-flex>
              </v-layout>
              <v-layout v-else mt-4>
                <v-flex><b>Previous NR: </b><span v-html="previousNr_link"></span></v-flex>
              </v-layout>
            </template>

            <template v-if="corp_num_required">
              <v-layout v-if="is_editing && !is_closed"
                        column
                        :class="{'form-group-error': $v.corpNum.$error}">
                <v-flex mt-4 fw-600>Related Corp #:</v-flex>
                <v-flex><v-text-field class="name-choice-input"
                                      v-model="corpNum"
                                      @input="$v.corpNum.$touch()" /></v-flex>
                <v-flex class="field-error"
                     v-if="!$v.corpNum.isValidCorpNum">Please enter a valid Incorporation Number</v-flex>
              </v-layout>
              <v-layout v-else>
                <v-flex mt-4 fw-600>Related Corp #: {{ corpNum }}</v-flex>
              </v-layout>
            </template>
          </v-layout>
        </InfoHeaderPopup>

        <v-flex shrink mx-3 style="height: 100px" v-if="!is_expanded">
          <v-divider vertical/>
        </v-flex>
        <!-- APPLICANT INFORMATION -->
        <InfoHeaderPopup title="Applicant Information:"
                         class="mr-4 ml-0"
                         :is_editing="is_editing"
                         :is_viewing="is_viewing"
                         :is_expanded="is_expanded"
                         infoType="applicant">
              <!--FORM FOR EDITING/VIEWING CLIENT and APPLICANT-->
              <clientinfoview :is_editing="is_editing"
                              :is_viewing="is_viewing"
                              :is_expanded="is_expanded"
                              ref="clientinfoview" />
        </InfoHeaderPopup>
      </v-layout>
    </v-container>
    <v-container v-if="is_editing && !is_closed" id="edit-mode-names">
        <!-- 2ND ROW  APPLICANT NAME CHOICES -->
        <v-layout style="width: 50%" align-center fs-15 wrap>
          <v-flex text-right pr-2 lg2>1.</v-flex>
          <v-flex lg10>
            <v-text-field v-model="compName1.name"
                          class="name-choice-input"
                          @input="$v.compName1.name.$touch()" />
          </v-flex>
          <v-flex offset-lg2
                  lg10
                  field-error
                  v-if="$v.compName1.name.$error">The first name choice is required</v-flex>
          <v-flex text-right pr-2 lg2>2.</v-flex>
          <v-flex lg10>
            <v-text-field v-model="compName2.name"
                          @input="$v.compName2.name.$touch()"
                          class="name-choice-input"/>
          </v-flex>
          <v-flex offset-lg2
                  lg10
                  field-error
                  v-if="$v.compName2.name.$error">
            To include a 3rd name choice the 2nd name choice is required</v-flex>
          <v-flex text-right pr-2 lg2>3.</v-flex>
          <v-flex lg10>
            <v-text-field v-model="compName3.name"
                          @input="$v.compName2.name.$touch()"
                          class="name-choice-input"/>
          </v-flex>
        </v-layout>
    </v-container>
  </fragment>
</template>

<script>
  import clientinfoview from '@/components/application/Examine/client/ClientInfoHeader.vue'
  import { required } from 'vuelidate/lib/validators'
  import { isActualDate, isFutureDate, isNotBlankSpace, isValidFormat } from "../../../../static/js/validators"
  import axios from '@/axios-auth'
  import InfoHeaderPopup from './InfoHeaderPopup'
  import nwpta from './nwpta/nwpta'
  import ActionsButtons from './ActionButtons'

  export default {
  name: 'RequestInfoHeader',
  components: {
    ActionsButtons,
    nwpta,
    InfoHeaderPopup,
    clientinfoview,
  },
  mounted() {
    this.$root.$on('saveEdits', this.save)
    this.$root.$on('cancelSave', this.cancelSave)
  },
  data() {
    return {
      corp_num_required: false,
      prev_nr_required: false,
      nwpta_required: false,
      jurisdiction_required: false,
      additional_info_template: null,
      is_lp_nwpta_type: null,
      is_cp_nwpta_type: null,
    }
  },
  validations() {
    // set basic validations that aren't conditional on any other fields
    var validations = {
      // first name choice is always required
      compName1: {
        name: {
          required,
          isNotBlankSpace
        }
      },
    }

    // if compName3 exists then compName2 must exist
    if (this.compName3.name && this.compName3.name.replace(/\s/g,'')) {
      validations.compName2 = {
        name: {
          required,
          isNotBlankSpace
        }
      }
    } else {
      validations.compName2 = {
        name: {
        }
      }
    }

    // validate jurisdiction if required
    if (this.jurisdiction_required && !this.is_closed) {
      validations.jurisdiction = {
        required,
      }
    }

    // validate corp # - not required, but if entered it must be validated
    if (this.corp_num_required && !this.is_closed) {
      validations.corpNum = {
        isValidCorpNum(value) {
          // if empty, it's valid - not required
          if (value == '' || value == null) return true;

          // valid corp numbers are between 7 and 10 characters long
          if (value.length < 7 || value.length > 10) return false;

          const myToken = sessionStorage.getItem('KEYCLOAK_TOKEN')
          const url = '/api/v1/corporations/' + value;
          return axios.get(url, {headers: {Authorization: `Bearer ${myToken}`}}).then(response => {
            return true;
          })
            .catch(error => {
              return false;
            });
        },
      }
    }

    // validate Expiry Date if present - only present when editing a furnished NR
    if (this.expiryDateForEdit !== null) {
      validations.expiryDateForEdit = {
        required,
        isValidFormat(value) {
          return isValidFormat(value);
        },
        isActualDate(value) {
          return isActualDate(value);
        },
        isFutureDate(value) {
          // don't do this validation if it is not an actual date yet
          if (value == '' || value == null || !isValidFormat(value) || !isActualDate(value)) return true;

          return isFutureDate(value);
        },
      }
    }

    // validate Previous NR # - not required, but if entered it must be validated
    if (this.prev_nr_required && !this.is_closed) {
      validations.previousNr = {
        isValidNr(value) {
          // if empty, it's valid - not required
          if (value == '' || value == null) return true;

          // valid NR #s are NR, space, 7 digits (10 characters total)
          if (value.length !== 10) return false;
          if (value.substr(0, 3) !== 'NR ') return false;

          const myToken = sessionStorage.getItem('KEYCLOAK_TOKEN')
          const url = '/api/v1/requests/' + value
          return axios.get(url, {headers: {Authorization: `Bearer ${myToken}`}}).then(response => {
            return true;
          })
            .catch(error => {
              return false;
            });
        },
      }
    }
    return validations;
  },
  computed: {
    activeRequestBannerPopUp() {
      if (this.$store.state.activeRequestBannerPopUp) {
        return this.$store.state.activeRequestBannerPopUp
      }
      return ''
    },
    additionalInfo: {
      get: function() {
        return this.$store.getters.additionalInfo == null ?  '' : this.$store.getters.additionalInfo;
      },
      set: function(value) {
        this.$store.commit('additionalInfo', value);
      }
    },
    can_edit() {
      if (this.is_my_current_nr) return true;
      if (this.$store.getters.userHasEditRole && ['DRAFT', 'HOLD', 'REJECTED', 'APPROVED', 'CONDITIONAL'].indexOf(this.nr_status) > -1 ) return true;
      return false;
    },
    compName1: {
      get() {
        return this.$store.getters.compName1;
      },
      set(value) {
        this.$store.commit('compName1', value);
      }
    },
    compName2: {
      get: function() {
        return this.$store.getters.compName2;
      },
      set: function(value) {
        this.$store.commit('compName2', value);
      }
    },
    compName3: {
      get: function() {
        return this.$store.getters.compName3;
      },
      set: function(value) {
        this.$store.commit('compName3', value);
      }
    },
    consumptionDate() {
      return this.$store.getters.consumptionDate;
    },
    corpNum: {
      get: function () {
        return this.$store.getters.corpNum;
      },
      set: function (value) {
        this.$store.commit('corpNum', value);
      }
    },
    details: {
      get: function() {
        return this.$store.getters.details;
      },
      set: function(value) {
        this.$store.commit('details', value);
      }
    },
    examiner() {
      return this.$store.getters.examiner;
    },
    expiryDate: {
      get: function() {
        return this.$store.getters.expiryDate;
      },
      set: function(value) {
        this.$store.commit('expiryDate', value);
      }
    },
    expiryDateForEdit: {
      get: function() {
        return this.$store.getters.expiryDateForEdit;
      },
      set: function(value) {
        this.$store.commit('expiryDateForEdit', value);
      }
    },
    internalComments: {
      get: function() {
        return this.$store.getters.internalComments;
      },
      set: function(value) {
        this.$store.commit('internalComments', value);
      }
    },
    internalComments_length() {
      // non-breaking attribute for number of comments (doesn't break on null)
      try {
        return this.internalComments.length;
      } catch (err) {
        return 0;
      }
    },
    is_approved_expired() {
      // if there is no expiry date, this NR is not approved-expired
      if (this.$store.getters.expiryDate == null) return false;

      let expired_date = new Date(this.$store.state.expiryDate);
      let date = new Date();
      if (this.$store.getters.currentState === "APPROVED" && date > expired_date) return true;
      return false;
    },
    is_closed() {
      if (['REJECTED', 'APPROVED', 'CONDITIONAL'].indexOf(this.nr_status) > -1) return true;
      return false;
    },
    is_editing() {
      return  this.$store.getters.is_editing;
    },
    is_expanded() {
      if (this.is_editing || this.is_viewing) return true
      return false
    },
    is_my_current_nr() {
      return this.$store.getters.is_my_current_nr;
    },
    jurisdiction: {
      get: function() {
        return this.$store.getters.jurisdiction;
      },
      set: function(value) {
        this.$store.commit('jurisdiction', value);
      }
    },
    jurisdiction_options() {
      return this.$store.getters.listJurisdictions;
    },
    natureOfBusiness: {
      get() {
        if (this.$store.getters.natureOfBusiness) {
          return this.$store.getters.natureOfBusiness
        }
        return ''
      },
      set(value) {
        this.$store.commit('natureOfBusiness', value);
      }
    },
    natureOfBusinessTruncated() {
      try {
        if (this.natureOfBusiness.length > 200) return this.natureOfBusiness.substr(0, 200) + '...';
        else return this.natureOfBusiness;
      } catch (err) {
        return this.natureOfBusiness;
      }
    },
    newComment: {
      get() {
        if (this.$store.state.newComment) {
          return this.$store.state.newComment
        }
        return ''
      }, set(e) {
        this.$store.commit('setNewComment', e)
      }
    },
    nr_status: {
      get: function() {
        return this.$store.getters.nr_status;
      },
      set: function(value) {
        this.$store.commit('nr_status', value);
      }
    },
    nrNumber() {
      return  this.$store.getters.nrNumber;
    },
    previousNr: {
      get: function () {
        return this.$store.getters.previousNr;
      },
      set: function (value) {
        this.$store.commit('previousNr', value);
      }
    },
    previousNr_link() {
      if (this.$store.getters.previousNr != undefined) {
        // KBM 2018-08-30 - removed for MVP but will be part of a future phase
        // return '<a href="/' + this.$store.getters.previousNr + '" target="_blank">' + this.$store.getters.previousNr + '</a>';
        return this.$store.getters.previousNr;
      }
      else return '';
    },
    priority() {
      return this.$store.getters.priority;
    },
    requestType: {
      get: function() {
        this.checkReqTypeRules(this.$store.getters.requestType);
        return this.$store.getters.requestType;
      },
      set: function(value) {
        this.$store.commit('requestType', value);
      }
    },
    requestType_desc() {
      try {
        return getDescFromList(this.requestType_options, this.requestType);
      } catch (err) {
        return 'ERROR!!';
      }
    },
    requestType_options() {
      return this.$store.getters.listRequestTypes;
    },
    requestTypeRules() {
      return this.$store.getters.requestTypeRules;
    },
    reservationCount: {
      get: function() {
        return this.$store.getters.reservationCount;
      },
      set: function(value) {
        this.$store.commit('reservationCount', value);
      }
    },
    is_viewing() {
      return this.$store.state.is_header_shown && !this.is_editing;
    },
    submitCount() {
      return this.$store.getters.submitCount;
    },
    submittedDate() {
      return this.$store.getters.submittedDate;
    },
  },
  watch: {
    nrNumber: function (val) {
      console.log('RequestInfoHeader.nrNumber watcher fired:' )
      this.$store.dispatch('getpostgrescompInfo',this.nrNumber);
      this.checkReqTypeRules(this.requestType);
    },
    requestType: function(val) {
      /*
       Show/hide elements of NR Details based on request type (display and edit).
       */
      this.checkReqTypeRules(val);
    }
  },
  methods: {
    toggleDetails() {
      if (this.$store.state.is_header_shown) this.$store.state.is_header_shown = false;
      else this.$store.state.is_header_shown = true;
      this.$store.commit('toggleRequestBannerPopUp', null)
      this.toggleCommentsPopUp(false)
    },
    edit() {
      // if this isn't the user's INPROGRESS, make it that
      if (!this.is_my_current_nr && !this.is_closed) {

        // track the previous state if it's currently in DRAFT (otherwise do not)
        if (this.$store.state.currentState == 'DRAFT') this.updateNRStatePreviousState('INPROGRESS', 'DRAFT');
        else this.$store.dispatch('updateNRState', 'INPROGRESS');
      }

      // KBM - REMOVED per ticket #970
      /*
      if (this.is_closed) {
        this.$store.dispatch('syncNR',this.nrNumber);
      }
      */
      this.$store.commit('toggleRequestBannerPopUp', null)
      this.toggleCommentsPopUp(false)
      this.$store.state.is_editing = true;
    },
    save() {
      if (!this.validate()) {
        // do not continue if there are validation errors
        return;
      }

      // if jurisdiction not required, clear the data (ie: BC)
      if (!this.jurisdiction_required) this.$store.commit('jurisdiction', null);

      // if corp num not required, clear the data
      if (!this.corp_num_required) this.$store.commit('corpNum', null);

      // if previous NR not required, clear the data
      if (!this.prev_nr_required) this.$store.commit('previousNr', null);

      // build Additional Info
      this.buildAdditionalInfo();

      // save Expiry Date - convert to UTC timestamp string to be consistent with data from API
      if (this.expiryDateForEdit !== null) {
        this.expiryDate = new Date(
            this.expiryDateForEdit.substr(6,4), // yyyy
            this.expiryDateForEdit.substr(3,2)-1, // mm
            this.expiryDateForEdit.substr(0,2), // dd
            23, //hr
            59) //min
          .toUTCString();
      }

      // adjust nwpta data if it was requested and the type was changed
      if (this.$refs.nwpta_ab != undefined) this.$refs.nwpta_ab.adjustUponSave();
      if (this.$refs.nwpta_sk != undefined) this.$refs.nwpta_sk.adjustUponSave();

      // set the state back if it was DRAFT, and clear previous value
      if (this.$store.state.previousStateCd == 'DRAFT') {
        this.$store.state.currentState = this.$store.state.previousStateCd;
        this.$store.state.previousStateCd = null;
      }

      this.$store.dispatch('updateRequest');
      this.$store.state.is_editing = false;

      // show full header after editing so user can see everything they changed
      this.$store.state.is_header_shown = true;
      this.$nextTick(function() { window.scrollTo(0,0) })
    },
    cancelSave() {
      // set the state back to the previous state - only when previous state is DRAFT
      // - otherwise just get original data
      if (this.$store.state.previousStateCd == 'DRAFT') this.revertToPreviousState();
      else this.$store.dispatch('getpostgrescompInfo',this.nrNumber)

      this.$store.state.is_editing = false;
    },
    buildAdditionalInfo() {
      var newAddInfo = "";

      // create new additional info from template if relevant; add to top of additional info
      if (this.additional_info_template !== null && this.additional_info_template != '') {


        // split templates based on || separator
        var templates = this.additional_info_template.split('||');
        for (var i = 0; i < templates.length; i++) {
          var template = templates[i];

          // corp num placeholder
          // if there is no corp num for this placeholder, do not use this bit of the template
          if (template.indexOf('<corp_num>') > -1) {
            if (this.corpNum != null && this.corpNum != '')
              template = template.replace('<corp_num>', this.corpNum);
            else template = '';
          }

          // previous NR placeholder
          // if there is no previous NR for this placeholder, do not use this bit of the template
          if (template.indexOf('<prev_nr>') > -1) {
            if (this.previousNr != null && this.previousNr != '')
              template = template.replace('<prev_nr>', this.previousNr);
            else template = '';
          }

          // NWPTA placeholder
          // if there is no NWPTA data for this placeholder, do not use this bit of the template
          if (template.indexOf('<nwpta>') > -1) {
            // KBM 2018-08-22 - Do nothing - I don't think we need to add to Additional Info for
            // NWPTA because it will have been added during initial entry into NRO, and we do not
            // change nwpta type (assumed, numbered) to trigger adding/changing anything in
            // Additional Info.
            template = '';
          }

          /*
          Check if this bit of text is already in Additional Info - ie: don't keep adding note
          re. Corp Num or previous NR every time user saves, even if they haven't changed that
          data.
          */
          if (template != '') {
            if (this.additionalInfo.indexOf(template) == -1) newAddInfo += template + ' ';
          }
        }
      }

      if (newAddInfo != '') this.additionalInfo = newAddInfo + '\n' + this.additionalInfo;
    },
    addNewComment() {

      // do nothing if comment is blank
      if (this.newComment == '' || this.newComment == null) return;

      // create new comment object with just text, and add it to list of comments in data structure
      var newCommentData = {
        comment: this.newComment,
        examiner: this.$store.state.examiner
      };
      this.internalComments = this.internalComments.concat(newCommentData);

      // clear newComment field for next comment added in this session
      this.$store.commit('setNewComment', null)
    },
    validate() {
      /*
      Validate form using vuelidate.
       */
      console.log('got to validate()');

      // trigger vuelidate validation in this component and child component
      this.$v.$touch();
      this.$refs.clientinfoview.$v.$touch();

      var nwpta_ab_invalid = false;
      if (this.$refs.nwpta_ab !== undefined) {
        this.$refs.nwpta_ab.$v.$touch();
        nwpta_ab_invalid = this.$refs.nwpta_ab.$v.$invalid;
      }
      var nwpta_sk_invalid = false;
      if (this.$refs.nwpta_sk !== undefined) {
        this.$refs.nwpta_sk.$v.$touch();
        nwpta_sk_invalid = this.$refs.nwpta_sk.$v.$invalid;
      }

      // return opposite of 'invalid' flags, since we want to know if this IS valid
      return !this.$v.$invalid && !this.$refs.clientinfoview.$v.$invalid &&
        !nwpta_ab_invalid && !nwpta_sk_invalid;
    },
    checkReqTypeRules(val) {

      if (this.requestTypeRules != null) {
        var rules = this.requestTypeRules.filter(findArrValueByAttr(val, 'request_type'))[0];

        if (rules == undefined) {
          this.corp_num_required = false;
          this.prev_nr_required = false;
          this.nwpta_required = false;
          this.jurisdiction_required = false;
          this.additional_info_template = null;
          this.is_lp_nwpta_type = null;
          this.is_cp_nwpta_type = null;

        } else {
          this.corp_num_required = rules.corp_num_required;
          this.prev_nr_required = rules.prev_nr_required;
          this.nwpta_required = rules.nwpta_required; /* not used, can be removed after business confirms */
          this.jurisdiction_required = rules.jurisdiction_required;
          this.additional_info_template = rules.additional_info_template;
          this.is_lp_nwpta_type = rules.is_lp_nwpta_type;
          this.is_cp_nwpta_type = rules.is_cp_nwpta_type;
        }
      }
    },

    // Update NR State and Previous State
    updateNRStatePreviousState(nrState, previousState) {
      console.log('Updating Examination state (plus prev state) for number ' + this.nrNumber + ' to ' + nrState)
      const myToken = sessionStorage.getItem('KEYCLOAK_TOKEN')
      const url = '/api/v1/requests/' + this.nrNumber;

      // save off nrNumber and $store because can't refer to "this" inside axios response
      var nrNumber = this.nrNumber;
      var store = this.$store;

      axios.patch(url,{"previousStateCd": previousState, "state": nrState} ,{headers: {Authorization: `Bearer ${myToken}`}})
        .then(function(response){
          console.log('state updated to ' + nrState + ' for ' + nrNumber);
          store.dispatch('getpostgrescompInfo', nrNumber);
        })
        .catch(error => console.log('ERROR: ' + error))
    },

    // set current state to previous state, and clear previous state field
    revertToPreviousState () {
      console.log('Updating Examination state & prev state for number ' + this.nrNumber);
      const myToken = sessionStorage.getItem('KEYCLOAK_TOKEN');
      const url = '/api/v1/requests/' + this.nrNumber;

      // save off nrNumber and $store because can't refer to "this" inside axios response
      var nrNumber = this.nrNumber;
      var store = this.$store;

      axios.patch(url,{"state": this.$store.state.previousStateCd, "previousStateCd": null} ,{headers: {Authorization: `Bearer ${myToken}`}})
        .then(function(response){
          console.log('state reverted to ' + store.state.previousStateCd + ' for ' + nrNumber);
          store.dispatch('getpostgrescompInfo', nrNumber);
        })
        .catch(error => console.log('ERROR: ' + error))
    },
    toggleCommentsPopUp(bool) {
      this.$store.commit('toggleCommentsPopUp', bool)
    },
  },
}
</script>

<style scoped>
  b {
    font-weight: 600 !important;
  }

  #edit-mode-names {
    position: relative;
    top: -200px;
    left: -75px;
  }

  .jurisdiction-dropdown {
    background-color: white;
    height: 40px !important;
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    border: 1px solid var(--l-grey);
    padding: 4px 15px 4px 15px !important;
    font-size: 15px;
    text-transform: none !important;
  }

  .info-banner-collapsed {
    background-color: var(--xl-grey);
    height: 120px;
  }

  .info-banner-xpanded {
    background-color: var(--xl-grey) !important;
  }

  .name-choice-input {
    border: 1px solid var(--l-grey);
    padding: 2px 0px 0px 6px;
    height: 40px !important;
    background-color: white;
  }

  .nr-number {
    font-size: 34px;
    font-weight: 600;
  }

  .request-type {
    font-size: 24px;
  }
 </style>
