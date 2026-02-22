<script setup>
import { ref } from 'vue';

const up_button_flash = ref(false);
function uploadChange() {
    up_button_flash.value = true;
}

// 定义模板引用
const uploadf = ref(null)

// 使用defineExpose暴露组件方法给父组件
import { defineExpose } from 'vue'

defineExpose({
    submitUpload
})

// 定义上传方法
function submitUpload() {
    ElMessageBox.confirm(
        '确认安装拓展组件吗?',
        '注意',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
        }
    )
        .then(() => {
            // 使用el-upload组件的submit方法上传文件
            uploadf.value.submit();
        })
        .catch(() => {
        })
}

const centerDialogVisible = ref(false);
const upPageCount = ref(5);
function uploadSuccess() {
    // 倒计时5秒
    const timer = setInterval(() => {
        centerDialogVisible.value = true;
        upPageCount.value--;
        if (upPageCount.value <= 0) {
            clearInterval(timer);
            // 倒计时结束后执行的操作
            location.reload();
        }
    }, 1000);
}

</script>
<template>
    <el-card>
        <h3>组件拓展</h3>
        <el-upload class="upload-demo" :on-success="uploadSuccess" :on-change="uploadChange" ref="uploadf"
            :auto-upload="false" drag action="http://localhost:8085/uploadFile" method="post" name="file" accept=".zip">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
                请把文件拖拽到此处 <em>或点击以上传</em>
            </div>
            <template #tip>
                <div class="el-upload__tip">
                    请选择.zip格式文件
                </div>
            </template>
        </el-upload>
        <el-button v-if="up_button_flash" type="primary" @click="submitUpload">上传</el-button>
    </el-card>

    <el-card style="margin-top: 20px;">
        <h3>已安装的组件</h3>
    </el-card>

    <el-dialog v-model="centerDialogVisible" title="注意" width="500" align-center>
        <span>{{ upPageCount }}秒后刷新页面</span>
    </el-dialog>

    <!-- <el-dialog title="插件安装确认" :visible.sync="installDialogVisible">
        <div v-if="pluginInfo">
            <p>名称: {{ pluginInfo.name }}</p>
            <p>版本: {{ pluginInfo.version }}</p>
            <p>描述: {{ pluginInfo.description }}</p>
        </div>
        <span slot="footer">
            <el-button @click="installDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmInstall">安装</el-button>
        </span>
    </el-dialog> -->
</template>