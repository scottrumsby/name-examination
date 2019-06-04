<!--eslint-disable-->
<template>
 <fragment>
   <!-- Edit Request button -->
   <v-btn :ripple="false"
          class="ma-0 pa-0 action-button"
          flat
          id="nr-details-edit-button"
          v-if="!is_editing"
          @click="edit"><img src="/static/images/buttons/edit-req.svg" /></v-btn>
   <v-btn flat
          v-shortkey="['alt', 'b']"
          @shortkey="toggleDetails()"
          class="ma-0 pa-0 action-button"
          :ripple="false"
          id="nr-details-show-hide-details-button"
          @click="toggleDetails">
     <img v-if="is_viewing" src="/static/images/buttons/hide-details.svg"/>
     <img v-else src="/static/images/buttons/show-details.svg"/>
   </v-btn>

   <!--GET NEXT button-->
   <v-btn flat
          class="ma-0 pa-0 action-button"
          :ripple="false"
          v-shortkey="['alt', 'n']"
          @shortkey="getNextCompany()"
          id="examine-get-next-button"
          v-if="userIsAnExaminer && !is_making_decision && !is_my_current_nr"
          @click="getNextCompany()"><img src="/static/images/buttons/get-next.svg" /></v-btn>

   <!-- CANCEL button -->
   <v-btn flat
          class="ma-0 pa-0 action-button"
          :ripple="false"
          id="examine-cancel-button"
          v-if="canCancel && !is_making_decision && !is_cancelled && !is_approved_expired && !is_consumed"
          data-target="#add-cancel-comment-modal"
          data-toggle="modal"><img src="/static/images/buttons/cancel-req.svg"/></v-btn>

   <!-- HOLD button -->
   <v-btn flat
          class="ma-0 pa-0 action-button"
          :ripple="false"
          v-shortkey="['alt', 'h']"
          @shortkey="holdRequest()"
          id="examine-hold-button"
          v-if="!is_making_decision && is_my_current_nr"
          @click="holdRequest()"><img src="/static/images/buttons/hold-req.svg"/></v-btn>

   <!-- DECISION button -->
   <v-btn flat
          class="ma-0 pa-0 action-button"
          :ripple="false"
          v-shortkey="['alt', 'd']"
          @shortkey="startDecision()"
          id="examine-decide-button"
          v-if="userIsAnExaminer && !is_making_decision && !is_complete && is_my_current_nr && !is_name_decision_made"
          @click="startDecision()"><img src="/static/images/buttons/decision.svg"/></v-btn>

   <!-- ACCEPT/REJECT/CANCEL DECISION buttons -->
   <v-btn depressed
          class="ma-0 pa-0 action-button"
          :ripple="false"
          v-shortkey="['alt', 'a']"
          @shortkey="nameAccept()"
          id="decision-approve-button"
          v-if="userIsAnExaminer && is_making_decision"
          style="font-weight: 700;"
          @click="nameAccept()">{{ acceptance_will_be_conditional ? 'Conditionally ' : ''}}Approve</v-btn>
   <v-btn depressed
          :ripple="false"
          v-shortkey="['alt', 'r']"
          @shortkey="nameReject()"
          class="ma-0 pa-0 action-button"
          id="decision-reject-button"
          v-if="is_making_decision"
          @click="nameReject()">Reject</v-btn>
   <v-btn depressed
          :ripple="false"
          v-shortkey="['alt', 'c']"
          @shortkey="is_making_decision=false"
          class="ma-0 pa-0 action-button"
          id="decision-cancel-button"
          v-if="is_making_decision"
          @click="is_making_decision=false">Back</v-btn>

   <!-- RE-OPEN (un-furnished) button -->
   <v-btn flat
          :ripple="false"
          class="ma-0 pa-0 action-button"
          id="examine-re-open-button"
          v-if="userCanEdit && is_complete && !is_furnished && !is_cancelled && !is_approved_expired"
          @click="reOpen()"><img src="/static/images/buttons/reopen-req.svg"/></v-btn>

   <!-- RESET (from furnished) button -->
   <v-btn flat
          :ripple="false"
          class="ma-0 pa-0 action-button"
          id="examine-reset-button"
          v-if="userCanEdit && is_complete && is_furnished && !is_cancelled && !is_approved_expired"
          @click="reset()"><img src="/static/images/buttons/reset-req.svg"/></v-btn>

   <!-- EXAMINE button - to claim/examine an NR that is on hold -->
   <v-btn flat
          :ripple="false"
          class="ma-0 pa-0 action-button"
          id="examine-button"
          v-if="can_claim"
          @click="claimNR()"><img src="/static/images/buttons/examine.svg"/></v-btn>
 </fragment>
</template>

<script>
/* eslint-disable */
  export default {
    name: 'ActionsButtons',
    props: ['can_edit', 'edit', 'is_viewing', 'toggleDetails'],
    data: function () {
      return {
        searchStr: '',
        exactPhrase: '',
        retval: [],
        is_running_manual_search: false,
        add_comment_display: "",
        cancel_comment_display: "",
        searching: false,
      }
    },
    computed: {
      decision_made: {
        get: function () {
          return this.$store.getters.decision_made;
        },
        set: function (value) {
          this.$store.commit('decision_made', value);
        }
      },
      is_viewing: {
        get() {
          return this.$store.state.is_header_shown
        },
        set(e) {

        }
      },
      currentState() {
        return this.$store.getters.currentState;
      },
      userId() {
        return this.$store.getters.userId;
      },
      userIsAnExaminer() {
        return this.$store.getters.userHasApproverRole;
      },
      userCanEdit() {
        return this.$store.getters.userHasEditRole;
      },
      canCancel() {
        return this.userCanEdit;
      },
      is_my_current_nr() {
        return this.$store.getters.is_my_current_nr;
      },
      is_complete() {
        return this.$store.getters.is_complete;
      },
      is_furnished() {
        if (this.$store.getters.furnished === "Y") return true;
        return false;
      },
      is_cancelled() {
        if (this.$store.getters.currentState === "CANCELLED") return true;
        return false;
      },
      is_approved_expired() {
        // if there is no expiry date, this NR is not approved-expired
        if (this.$store.getters.expiryDate == null) return false;

        let expired_date = new Date(this.$store.state.expiryDate);
        let today = new Date();
        console.log('***');
        console.log(this.$store.getters.currentState);
        console.log(expired_date);
        if (this.$store.getters.currentState === "APPROVED" && today > expired_date) return true;
        return false;
      },
      is_consumed() {
        if (this.consumptionDate != null) return true;
        else return false;
      },
      is_editing() {
        return  this.$store.getters.is_editing;
      },
      is_making_decision: {
        get: function() {
          return this.$store.getters.is_making_decision;
        },
        set: function(value) {
          this.$store.commit('is_making_decision', value);
        }
      },
      is_name_decision_made() {
        // is a decision already made for the current name? Happens right after reset/re-open.
        if (this.currentNameObj.state !== 'NE') return true;
        else return false;
      },
      acceptance_will_be_conditional() {
        return this.$store.getters.acceptance_will_be_conditional;
      },
      can_claim() {
        console.log('got to can_claim with status ' + this.currentState);
        // can this user claim the NR? Based on state.
        if (this.userIsAnExaminer && ['DRAFT', 'HOLD'].indexOf(this.currentState) > -1) return true;
        else return false;
      },
      compName1() {
        return this.$store.getters.compName1;
      },
      compName2() {
        return this.$store.getters.compName2;
      },
      compName3() {
        return this.$store.getters.compName3;
      },
      compName1State() {
        return this.$store.getters.compName1.state;
      },
      compName2State() {
        return this.$store.getters.compName2.state;
      },
      compName3State() {
        return this.$store.getters.compName3.state;
      },
      decision_1() {
        return this.decisionReasonOrConflictList(this.compName1);
      },
      decision_2() {
        return this.decisionReasonOrConflictList(this.compName2);
      },
      decision_3() {
        return this.decisionReasonOrConflictList(this.compName3);
      },
      currentNameObj: {
        get: function() {
          return this.$store.getters.currentNameObj;
        },
        set: function (value) {
          this.$store.commit('currentNameObj', value);
        }
      },
      currentName() {
        return this.$store.getters.currentName;
      },
      currentChoice: {
        get: function () {
          return this.$store.getters.currentChoice
        },
        set: function (value) {
          this.$store.commit('currentChoice', value);
        }
      },
      is_undoable_1() {
        // first test generic reasons why a name would or wouldn't be undoable
        var undoable = this.is_undoable(this.compName1);

        if (undoable) {
          // if name choices 2 and 3 have not been decided, then 1 is undoable
          if ((this.compName2.state == 'NE' || this.compName2.state == null) &&
            (this.compName3.state == 'NE' || this.compName3.state == null)) {
            undoable = true;
          }
          else undoable = false;
        }

        return undoable;
      },
      is_undoable_2() {
        // first test generic reasons why a name would or wouldn't be undoable
        var undoable = this.is_undoable(this.compName2);

        if (undoable) {
          // if name choice 3 has not been decided, then 2 is undoable
          if (this.compName3.state == 'NE' || this.compName3.state == null) {
            undoable = true;
          }
          else undoable = false;
        }

        return undoable;
      },
      is_undoable_3() {
        // first test generic reasons why a name would or wouldn't be undoable
        var undoable = this.is_undoable(this.compName3);

        return undoable;
      },
      listDecisionReasons() {
        return this.$store.getters.listDecisionReasons;
      },
      internalComments: {
        get: function() {
          return this.$store.getters.internalComments;
        },
        set: function(value) {
          this.$store.commit('internalComments', value);
        }
      },
      consumptionDate() {
        return this.$store.getters.consumptionDate;
      },
    },
    mounted() {
      console.log('Compname Mounted')
      if(this.$store.getters.nrNumber == null){
        console.log('Mounted->get next NR number')
        this.$store.dispatch('getpostgrescompNo');
      }
      this.setFocus();

      // set manual search string based on current name - fixes bug related to leaving
      // and coming back to same NR
      this.searching = true;
      this.setManualSearchStr(this.currentName);
      this.exactPhrase = '';
    },
    methods: {
      /**
       * decisionReasonOrConflictList:  gets the decision reason(s) whether or not there's anything in the decision text field.
       * In some older NRs, there is no decision reason text.  In these cases we want to display the list of conflicts instead.
       */
      decisionReasonOrConflictList: function (compname) {

        if (!compname) {
          return;
        }

        if (this.is_complete) {

          if (compname.decision_text) {
            return compname.decision_text;
          } else {
            return this.getConflictList(compname);
          }
        } else {
          return compname.decision_text
        }
      },
      getConflictList(compname) {
        if (!compname.conflict1) {
          return;
        }

        let reasons = `Rejected due to conflicts:\n${compname.conflict1}`;
        if (compname.conflict2) {
          reasons += ", " + compname.conflict2;
        }
        if (compname.conflict3) {
          reasons += ", " + compname.conflict3;
        }

        return reasons;
      },
      getNextCompany() {
        this.$store.dispatch('resetValues');
        this.searching = true;
        this.$store.dispatch('getpostgrescompNo');
      },
      startDecision() {
        this.$store.state.is_making_decision = true;
      },
      nameAccept() {
        this.$store.commit('decision_made', 'APPROVED');
        this.$store.commit('currentCondition', null);
      },
      nameReject() {
        this.$store.commit('decision_made', 'REJECTED');
        this.$store.commit('currentCondition', null);
      },
      reOpen() {
        /* Workflow:
         If EXAMINER:
         - move to INPROGRESS
         If EDITOR (ADMIN):
         - move to INPROGRESS with edit screen open
         - upon save/cancel, move to DRAFT
         */
        if (this.userIsAnExaminer) {
          this.$store.commit('currentState', 'INPROGRESS');
        }
        else {
          this.$store.commit('currentState', 'INPROGRESS');

          // initialize user in edit mode, with previous state set so NR gets set back to draft
          //  when user is done changing name, adding comment, etc.
          this.$store.state.previousStateCd = 'DRAFT';
          this.$store.state.is_editing = true;
        }

        // set reset flag so name data is managed between Namex and NRO correctly
        this.$store.commit('hasBeenReset', true);

        // update request in database
        this.$store.dispatch('updateRequest');
      },
      reset() {
        /* Workflow:
         If EXAMINER:
         - move to INPROGRESS
         If EDITOR (ADMIN):
         - move to INPROGRESS with edit screen open
         - upon save/cancel, move to DRAFT
         */
        if (this.userIsAnExaminer) {
          this.$store.commit('currentState', 'INPROGRESS');
        }
        else {
          this.$store.commit('currentState', 'INPROGRESS');

          // initialize user in edit mode, with previous state set so NR gets set back to draft
          //  when user is done changing name, adding comment, etc.
          this.$store.state.previousStateCd = 'DRAFT';
          this.$store.state.is_editing = true;
        }

        this.$store.commit('furnished', 'N');

        // update request in database and NRO
        this.$store.dispatch('updateRequest');
      },
      claimNR() {
        this.$store.dispatch('updateNRState', 'INPROGRESS');
      },
      holdRequest() {
        this.$store.dispatch('updateNRState', 'HOLD');
      },
      runManualRecipe(){
        console.log("Running manual recipe on " + this.searchStr + '/' + this.exactPhrase);
        this.$store.dispatch('runManualRecipe', {searchStr:this.searchStr, exactPhrase:this.exactPhrase});
      },
      setIcon(name_state) {
        if (name_state == 'REJECTED') {
          return '<i class="fa fa-times icon-rejected"></i>';
        }
        else if (name_state == 'APPROVED' || name_state == 'CONDITION') {
          return '<i class="fa fa-check icon-accepted"></i>';
        }
        else return '';
      },
      undoDecision(name_number) {
        console.log(name_number);
        this.$store.dispatch('undoDecision', name_number);

        // set the undone name choice to the current (actionable) choice
        if (name_number == 1) this.currentNameObj = this.compName1;
        if (name_number == 2) this.currentNameObj = this.compName2;
        if (name_number == 3) this.currentNameObj = this.compName3;

      },
      is_undoable(name) {

        // if the NR is closed in any way, a name is not undoable - the NR will have to be
        // re-opened first.

        if (!this.userIsAnExaminer) return false;

        if (!this.is_my_current_nr) return false;

        // if the NR is furnished, nothing is undoable
        if (this.$store.state.furnished === 'Y')  return false;

        // if this name is complete (ie: anything other than NE) it's undoable
        if (name.state == 'NE' || name.state == null) return false;

        return true;
      },
      quickApprove() {
        this.currentNameObj.decision_text = ''
        console.log('quickApprove')

        this.decision_made = 'APPROVED'
        this.nameAcceptReject()
      },
      rejectDescriptive() {

        this.currentNameObj.decision_text = 'Require descriptive second word or phrase * E.G. ' +
          'Construction, Gardening, Investments, Holdings, Etc.'
        this.decision_made = 'REJECTED'
        this.nameAcceptReject()
      },
      rejectDistinctive() {
        // When this was written, the 16th index of listDecisionReasons was the string needed for a distinctive term missing
        // it was decided to HARD CODE this value until another solution is found
        // var distinctiveStr = this.listDecisionReasons[16].reason
        this.currentNameObj.decision_text = "Require distinctive, nondescriptive first word or " +
          "prefix * E.G. Person's name, initials, geographic location, etc."
        this.decision_made = 'REJECTED'
        this.nameAcceptReject()
      },
      onSubmit()
      {
        this.$store.dispatch('resetValues');
        this.$store.dispatch('runManualRecipe', {searchStr:this.searchStr, exactPhrase:this.exactPhrase});

        if (this.searchStr != this.currentName) this.is_running_manual_search = true;
      },
      resetSearchStr(){
        this.searching = true;
        this.setManualSearchStr(this.currentName);
        this.exactPhrase = '';
        this.is_running_manual_search = false;
      },
      nameAcceptReject() {

        // save decision
        console.log('nameAcceptReject decision_made:' + this.decision_made)
        if (this.decision_made == 'APPROVED') {
          this.currentNameObj.state = 'APPROVED';
        }
        else {
          this.currentNameObj.state = 'REJECTED';
        }

        // send decision to API and reset flags
        this.$store.dispatch('nameAcceptReject');
        this.decision_made = null;
        this.is_making_decision = false;
      },
      setFocus: function() {
        if(this.$refs.search) {
          this.$refs.search.focus();
        }
      },
      setManualSearchStr(val) {
        console.log('setManualSearchStr() called with ' + val);
        this.searchStr =  val;
      },
      addNewComment(value) {
        // create new comment object with just text, and add it to list of comments in data structure
        var newCommentData = {
          comment: value,
          examiner: this.$store.state.examiner
        };
        this.internalComments = this.internalComments.concat(newCommentData);
      },
      cancelNr() {
        this.addNewComment(this.cancel_comment_display);
        this.$store.dispatch('cancelNr', 'CANCELLED');
      },
      cancelNrCancel() {
        this.cancel_comment_display = "";
        $("#cancel-comment-text").prop('disabled', false); // TODO need this?
      },
    },
    watch: {
      cancel_comment_display: function(val) {
        console.log('cancel_comment_display watcher fired:' + val)
        if (val)
          $("#cancel-nr-after-comment-button").prop('disabled', false);
        else
          $("#cancel-nr-after-comment-button").prop('disabled', true);
      },
      currentName: function (val) {
        console.log('CompName.currentName watcher fired:' + val)
        this.searching = true;
        this.setManualSearchStr(val);
        this.exactPhrase = '';
      },
      nrNumber: function (val) {
        console.log('CompName.nrNumber watcher fired:' + val)
        if(val != null){ this.runManualRecipe()}
      },
      searchStr: function (val) {
        console.log('searchStr watcher fired: ' + val)
        if (this.searching) {
          this.runManualRecipe();
          this.searching = false;
        }
      }
    }
  }
</script>


<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
