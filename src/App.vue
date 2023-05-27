<script setup>
import { RouterView } from 'vue-router';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const wallet = computed(() => store.state.wallet);
const logout = () => store.dispatch('disconnectWallet');
store.dispatch('checkWalletConnected');
</script>

<template>
  <el-container>
    <el-header v-if="!wallet.connected" class="logged-out">
      <img src="@/assets/logo.png" />
      <span>Unlockable content for Tezos NFTs</span>
    </el-header>
    <el-header v-if="wallet.connected" class="logged-in">
      <el-row style="max-width: 1280px; margin: 0 auto; margin-top: 8px" align="middle">
        <el-col :sm="24" :md="12">
          <img src="@/assets/logo.png" style="width: 100px" />
        </el-col>
        <el-col :sm="24" :md="12" style="text-align: right">
          <el-button round plain @click="logout">Unsync</el-button>
          <span class="hidden-xs-only" style="margin-left: 15px">{{ wallet.pkhDomain }}</span>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <div style="max-width: 1280px; margin: 0 auto">
        <RouterView />
      </div>
    </el-main>
    <el-footer>
      Built by
      <a href="https://cclabs.tech/" target="_blank">Codecrafting Labs</a>. Made with
      <i class="fas fa-heart" style="color: #f64947"></i>
    </el-footer>
  </el-container>
</template>

<style lang="scss">
html,
body {
  background: #fcfcfc;
}

#app .el-container {
  min-height: 100%;
}

.el-header {
  &.logged-out {
    text-align: center;
    height: 248px;

    img {
      height: 136px;
      margin-top: 48px;
    }
    span {
      display: block;
      margin-top: 24px;
      font-size: 2em;
      color: #ababab;
      text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
    }
  }

  &.logged-in {
    background: #fff;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
  }
}

.el-footer {
  text-align: center;
  margin-top: 60px;
  padding: 20px 0;
}
</style>
