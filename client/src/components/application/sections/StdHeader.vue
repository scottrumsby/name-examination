<!--eslint-disable-->
<template>
    <v-container id="header-main" class="top-nav-toolbar" fluid>
      <v-layout style="display: flex; justify-content: start">
        <div>
          <router-link to="/home">
            <img src="static/images/top-nav.png"
                 alt="Names Examination"
                 @click="tab=null"
                 title="Names Examination Header"/>
          </router-link>
        </div>
        <div v-if="auth">
          <v-toolbar flat color="white" height="70px">
            <v-toolbar-items>
              <v-btn flat
                     class="custom-btn"
                     :ripple="true"
                     style="width: 170px;" :href="adminURL"
                     id="admin"
                     target="_blank">
                Admin
              </v-btn>
              <v-tabs height="70px"
                      slider-color="green"
                      :fixed-tabs="true"
                      v-model="tab">
                <!--Hidden tab for when viewing part of app that isn't under a tab-->
                <v-tab to="/" style="display: none"></v-tab>
                <v-tab v-if="userCanExamine"
                       to="/nameExamination"
                       style="width: 170px;">Examine Names</v-tab>
                <v-tab to="/find" style="width: 170px;" id="header-search-link">Search</v-tab>
              </v-tabs>
            </v-toolbar-items>
          </v-toolbar>
        </div>
        <div class="ml-auto px-3">
          <v-toolbar flat color="white" height="70px">
            <template v-if="auth">
              <v-form v-on:submit="onSubmit">
                <div style="display: flex;">
                  <div>
                    <v-text-field class="styled-input"
                                  autocomplete="off"
                                  type="search"
                                  placeholder="NR Number Lookup"
                                  v-model="nrNum"
                                  id="header-search-input" />
                  </div>
                  <div class="search-icon mt-auto mb-auto">
                    <v-btn flat icon color="white" class="m-1" @click="submit()">
                      <v-icon>search</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-form>
              <div id="userid" class="ml-5 mt-auto mb-auto mp-italic">{{ userId }}</div>
              <div class="vertical-divider"/>
              <a class="mt-auto mb-auto mp-16" id="header-logout-button" @click="onLogout">Log Out</a>
            </template>
            <router-link v-if="!auth"
                         class="mt-auto mb-auto mp-16"
                         id="header-login-button"
                         to="/signin">Login</router-link>
          </v-toolbar>
        </div>
      </v-layout>
    </v-container>
</template>

<script>
/* eslint-disable */
  export default {
    name: "std-header",
    data () {
      return {
        nrNum: '',
        tab: null,
      }
    },
    computed: {
      path() {
        return this.$route.path
      },
      userId() {
        return this.$store.getters.userId
      },
      auth() {
        return this.$store.getters.isAuthenticated
      },
      userCanExamine() {
        return this.$store.getters.userHasApproverRole
      },
      adminURL() {
        return this.$store.getters.adminURL
      },
    },
    watch: {
      path(newPath) {
        let tabbedRoutes = ['/find', '/nameExamination']
        if (!tabbedRoutes.includes(newPath)) {
          this.tab = '/'
        }
      }
    },
    methods: {
      onLogout() {
        this.$store.dispatch('logout')
        window.location.assign("/");
      },
      onSubmit(e) {
        e.preventDefault()
        this.submit()
      },
      submit() {
        if (this.nrNum) {
          let myNum = this.nrNum.toUpperCase().trim();
          if (myNum.includes('NR')) {
            if (!myNum.includes('NR ')) {
              myNum = myNum.replace('NR', 'NR ')
            }
          } else {
            myNum = 'NR ' + myNum
          }
          console.log('Set new NR number to:' + myNum)
          this.$store.dispatch('newNrNumber', myNum)
          this.nrNum = ''
          this.$router.push('/nameExamination')
        }
      }
    }
  }
</script>


<style scoped>
  #admin {
    font-size: 19px;
    padding-top: 1px;
    color: #1a5a96 !important;
    text-decoration: none;
  }

  .vertical-divider {
    width: 1px;
    height: 30px;
    border-left: 1px solid #bcbec5;
    margin: auto 18px auto 18px;
  }
  #header-logout-button {
    font-size: 15px !important;
    color: var(--link) !important;
    cursor: pointer;
  }

  #admin::before {
    color: transparent
  }

  .mp-italic {
    font-family: MyriadWebPro-Italic;
    font-size: 16px;
  }

  .mp-16 {
    font-size: 16px;
  }

  .top-nav-toolbar {
    position: absolute;
    padding: 0px;
    left: 0px;
    top: 0px;
    height: 70px;
    background-color: white !important;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.25);
  }

 .innactive-tab {
   font-size: 19px !important;
   color: #1a5a96 !important;
   text-decoration: none !important;
 }

 .search-icon {
   background-color: #fcba19 !important;
   width: 40px;
   height: 40px;
 }

 .styled-input {
   height: 40px;
   width: 225px;
   background-color: #F2F2F2;
   margin-top: auto;
   margin-bottom: auto;
   padding: 5px 10px 5px 10px;
   border: none !important;
 }


</style>
