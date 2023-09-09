<script setup>
import { reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { request, API_URL } from './../util/api';
import prettyBytes from 'pretty-bytes';

const store = useStore();
const route = useRoute();

const wallet = computed(() => store.state.wallet);
const login = () => store.dispatch('connectWallet');

const lock = reactive({
  loading: true,
  name: '',
  description: '',
  files: [],
});

const loadLock = async () => {
  lock.loading = true;
  if (!store.state.wallet.connected) {
    request.get(`/lock/${route.params.lockUuid}/preview`).then(res => {
      lock.name = res.data.name;
      lock.description = res.data.description;
      lock.loading = false;
    });
  } else {
    request.get(`/lock/${route.params.lockUuid}`).then(res => {
      lock.name = res.data.name;
      lock.description = res.data.description;
      lock.files = res.data.files;
      lock.loading = false;
    });
  }
};

const downloadFile = async hash => {
  request.get(`/lock/${route.params.lockUuid}/file/${hash}`).then(res => {
    window.open(`${API_URL}/stream/${res.data.stream}`, '_blank');
  });
};

watch(
  () => store.state.wallet.connected,
  async connected => {
    if (connected === true) {
      loadLock();
    }
  },
);

loadLock();
</script>

<template>
  <el-row :gutter="20" style="margin-top: 48px; text-align: center">
    <el-col :span="16" :offset="4">
      <el-card shadow="always" v-loading="lock.loading">
        <h1>{{ lock.name }}</h1>
        <p>{{ lock.description }}</p>

        <div class="connect" v-if="!wallet.connected">
          <el-button type="primary" round @click="login"
            ><i class="fa-regular fa-wallet"></i> Connect Wallet</el-button
          >
          <span
            >Unlock this content by connecting your wallet to verify you have the required
            NFT(s).</span
          >
        </div>

        <div class="files" v-if="wallet.connected">
          <el-table
            :data="lock.files"
            empty-text="You do not have the required NFT(s) to access these files"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="name" label="Name" />
            <el-table-column prop="size" label="Size" width="124">
              <template #default="scope">
                {{ prettyBytes(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="mimetype" label="Type">
              <template #default="scope">
                <i v-if="scope.row.mimetype === 'application/pdf'" class="fa-solid fa-file-pdf"></i>
                <i
                  v-else-if="scope.row.mimetype.startsWith('image/')"
                  class="fa-solid fa-file-image"
                ></i>
                <i
                  v-else-if="scope.row.mimetype.startsWith('video/')"
                  class="fa-solid fa-file-video"
                ></i>
                <i
                  v-else-if="scope.row.mimetype === 'application/zip'"
                  class="fa-solid fa-file-zipper"
                ></i>
                <i v-else class="fa-solid fa-file-binary"></i>
                {{ scope.row.mimetype }}
              </template>
            </el-table-column>
            <el-table-column label="" width="75" align="right">
              <template #default="scope">
                <i
                  class="fa-solid fa-download"
                  @click="downloadFile(scope.row.hash)"
                  style="cursor: pointer"
                ></i>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.connect {
  text-align: center;
  margin-top: 48px;

  .el-button.is-round {
    font-size: 1.25em;
    padding: 20px 60px;

    i {
      margin-right: 8px;
    }
  }

  span {
    display: block;
    margin: 16px 0;
    font-size: 0.9em;
    color: #999;
  }
}

.files {
  margin-top: 24px;
}

.fa-download {
  color: var(--el-color-primary);
}
</style>
