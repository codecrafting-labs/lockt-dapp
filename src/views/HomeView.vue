<script setup>
import { ref, reactive, computed } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { request } from "./../util/api";
import dayjs from "dayjs";

const store = useStore();
const wallet = computed(() => store.state.wallet);
const locks = computed(() => store.state.locks);
const login = () => store.dispatch("connectWallet");

const deleteLock = (lockId) => store.dispatch("deleteLock", lockId);

const copyShareLink = (lockId) => {
  navigator.clipboard.writeText(`https://lockt.io/u/${lockId}`);
  ElMessage({
    message: "Share link copied.",
    type: "success",
  });
};

const dialogFormVisible = ref(false);

const formatDate = (dateString) => {
  const date = dayjs(dateString);
  return date.format("MM/DD/YYYY h:mm a");
};

const form = reactive({
  contract: "",
  tokens: "",
  name: "",
  description: "",
  amount: "1",
  uploadFiles: [],
});

const upload = ref();

const handleChange = (uploadFile, uploadFiles) => {
  form.uploadFiles = uploadFiles;
};

const handleRemove = (uploadFile, uploadFiles) => {
  form.uploadFiles = uploadFiles;
};

const submitUpload = async () => {
  const fData = new FormData();
  fData.append("contract", form.contract);
  fData.append("tokens", form.tokens);
  fData.append("name", form.name);
  fData.append("description", form.description);
  fData.append("amount", form.amount);

  for (const file of form.uploadFiles) {
    fData.append("files", file.raw, file.name);
  }

  const res = await request.post("/user/lock", fData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  console.log(res);
};
</script>

<template>
  <div class="connect" v-if="!wallet.connected">
    <el-button type="primary" round plain @click="login"
      ><i class="fa-regular fa-wallet"></i> Connect Wallet</el-button
    >
  </div>

  <template v-if="wallet.connected">
    <el-row :gutter="20" style="margin-top: 48px">
      <el-col :span="24">
        <el-button type="primary" round @click="dialogFormVisible = true"
          ><i class="fa-solid fa-lock"></i> Create Lock</el-button
        >
        <el-card
          shadow="always"
          style="margin-top: 16px"
          v-loading="locks.loading"
        >
          <el-table :data="locks.data" stripe style="width: 100%">
            <el-table-column prop="name" label="Name" width="200">
              <template #default="scope">
                {{ scope.row.name }}
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="Copy Share Link"
                  placement="top"
                >
                  <i
                    class="fa-solid fa-copy"
                    style="cursor: pointer; margin-left: 8px"
                    @click="copyShareLink(scope.row.uuid)"
                  ></i>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="# Files" width="100" align="center">
              <template #default="scope">
                {{ scope.row.files.length }}
              </template>
            </el-table-column>
            <el-table-column prop="contract" label="Contract">
              <template #default="scope">
                <el-link
                  type="info"
                  :href="`https://better-call.dev/mainnet/${scope.row.contract}`"
                  >{{ scope.row.contract.substr(0, 6) }}...{{
                    scope.row.contract.substr(-6)
                  }}<i
                    class="fa-solid fa-up-right-from-square"
                    style="margin-left: 8px"
                  ></i
                ></el-link>
              </template>
            </el-table-column>
            <el-table-column prop="tokens" label="Token ID(s)">
              <template #default="scope">
                <el-tag type="warning">{{ scope.row.tokens }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created" label="Created" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.created) }}
              </template>
            </el-table-column>
            <el-table-column label="" align="right" width="95">
              <template #default="scope">
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteLock(scope.row.uuid)"
                  >Delete</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="dialogFormVisible">
      <h2 style="text-align: center; margin-top: 0">
        Create Unlockable Content
      </h2>
      <el-form label-position="right" label-width="148px" :model="form">
        <el-form-item label="Contract Address">
          <el-input
            v-model="form.contract"
            placeholder="Enter KT1 collection address"
          />
        </el-form-item>
        <el-form-item label="Token ID(s)">
          <el-input v-model="form.tokens" placeholder="NFT token id(s)" />
          <span class="helper"
            >Enter a wilcard [*], a range [3-21], or a comma separated list of
            single ids or ranges</span
          >
        </el-form-item>
        <el-form-item label="Amount">
          <el-input v-model="form.amount" placeholder="1" />
          <span class="helper">Number of tokens required</span>
        </el-form-item>
        <el-form-item label="Name">
          <el-input
            v-model="form.name"
            placeholder="Name your unlockable content"
          />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="form.description"
            placeholder="Describe your unlockable content"
          />
        </el-form-item>
        <el-form-item label="Files to Lock">
          <el-upload
            ref="upload"
            class="upload"
            drag
            action="#"
            multiple
            :auto-upload="false"
            :on-change="handleChange"
            :on-remove="handleRemove"
          >
            <i class="fa-solid fa-file-circle-plus"></i>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">Files with a size less than 50MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitUpload">Submit</el-button>
          <!-- <el-button @click="resetForm(ruleFormRef)">Reset</el-button> -->
        </el-form-item>
      </el-form>
    </el-dialog>
  </template>
</template>

<style scoped lang="scss">
.connect {
  text-align: center;
  margin-top: 48px;

  .el-button.is-round {
    font-size: 1.25em;
    padding: 25px 60px;

    i {
      margin-right: 8px;
    }
  }
}

.el-button {
  i {
    margin-right: 8px;
  }
}

.helper {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 7px;
}

.upload {
  width: 100%;

  i {
    font-size: 67px;
    color: var(--el-text-color-placeholder);
    margin: 40px 0 16px;
    line-height: 50px;
  }
}
</style>
