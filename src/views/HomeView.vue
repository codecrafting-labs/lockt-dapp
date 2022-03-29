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
  loading: false,
});

const rules = reactive({
  contract: [{ required: true, message: "Enter a Contract Address" }],
  tokens: [{ required: true, message: "Enter the token id(s)" }],
  name: [{ required: true, message: "Enter the name" }],
});

const uploadForm = ref(null);
const uploadDragDrop = ref(null);

const showForm = () => {
  if (uploadForm.value) {
    uploadForm.value.resetFields();
    uploadForm.value.clearValidate();
  }
  if (uploadDragDrop.value) {
    uploadDragDrop.value.clearFiles();
  }
  form.uploadFiles = [];
  dialogFormVisible.value = true;
};

const handleChange = (uploadFile, uploadFiles) => {
  form.uploadFiles = uploadFiles;
};

const handleRemove = (uploadFile, uploadFiles) => {
  form.uploadFiles = uploadFiles;
};

const submitUpload = async (formRef) => {
  formRef.validate(async (valid) => {
    if (valid) {
      form.loading = true;
      const fData = new FormData();
      fData.append("contract", form.contract);
      fData.append("tokens", form.tokens);
      fData.append("name", form.name);
      fData.append("description", form.description);
      fData.append("amount", form.amount);

      for (const file of form.uploadFiles) {
        fData.append("files", file.raw, file.name);
      }

      await request.post("/user/lock", fData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (uploadDragDrop.value) {
        uploadDragDrop.value.clearFiles();
      }

      dialogFormVisible.value = false;
      form.uploadFiles = [];
      form.loading = false;
      store.dispatch("refreshLocks");
    } else {
      return false;
    }
  });
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
        <el-button type="primary" round @click="showForm"
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
      <div v-loading="form.loading" element-loading-text="Uploading...">
        <h2 style="text-align: center; margin-top: 0">
          Create Unlockable Content
        </h2>
        <el-form
          label-position="right"
          label-width="148px"
          :model="form"
          :rules="rules"
          ref="uploadForm"
        >
          <el-form-item label="Contract Address" prop="contract">
            <el-input
              v-model="form.contract"
              placeholder="Enter KT1 collection address"
            />
          </el-form-item>
          <el-form-item label="Token ID(s)" prop="tokens">
            <el-input v-model="form.tokens" placeholder="NFT token id(s)" />
            <span class="helper"
              >Enter a wilcard [*], a range [3-21], or a comma separated list of
              single ids or ranges</span
            >
          </el-form-item>
          <el-form-item label="Amount" prop="amount">
            <el-input v-model="form.amount" placeholder="1" />
            <span class="helper">Number of tokens required</span>
          </el-form-item>
          <el-form-item label="Name" prop="name">
            <el-input
              v-model="form.name"
              placeholder="Name your unlockable content"
            />
          </el-form-item>
          <el-form-item label="Description" prop="description">
            <el-input
              v-model="form.description"
              placeholder="Describe your unlockable content"
            />
          </el-form-item>
          <el-form-item label="Files to Lock">
            <el-upload
              ref="uploadDragDrop"
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
                <div class="el-upload__tip">
                  Files with a size less than 100 MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitUpload(uploadForm)"
              >Submit</el-button
            >
            <!-- <el-button @click="resetForm(ruleFormRef)">Reset</el-button> -->
          </el-form-item>
        </el-form>
      </div>
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
