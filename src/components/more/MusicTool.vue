<script setup>
import { ref, watch } from 'vue'
const avatar_url = ref('img/731ac3e8e6dd38c397bbab65b0197a171862641106.png');
const musicList_flag = ref(false);

const selectedMusic = ref(1);
const options = ref([
    { value: 1, label: 'Daisy Crown (中文版) - 鸣潮先约电台' },
    { value: 2, label: '她的梦 - 战双帕弥什/Sawako碎花' },
    { value: 3, label: '画心 - 韩兮浅' },
    { value: 4, label: '勾指起誓 - 猫瑾' },
    { value: 5, label: '东京不太热（人太多 大部分是漫无目的的走） - 封茗囧菌' },
]);

const musicList_appendTo = ref('#app');
setTimeout(() => {
    musicList_appendTo.value = '.musicToolBox';
}, 0);

// 监听selectedMusic变化
watch(selectedMusic, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        console.log(`selectedMusic 从 ${oldVal} 变化到 ${newVal}`);
    }
});
</script>
<template>
    <el-card>
        <template #header>
            <el-row :gutter="10">
                <el-col :span="6" style="display: flex;align-items: center;justify-content: center;">
                    <el-avatar shape="square" :size="50" fit="cover" :src="avatar_url" />
                </el-col>
                <el-col :span="1">
                    <el-divider direction="vertical" style="height: 100%;" />
                </el-col>
                <el-col :span="17" style="display: flex;flex-direction: column;justify-content: center">
                    <el-text>曲名</el-text>
                    <el-text size="small">歌手 / 专辑</el-text>
                </el-col>
            </el-row>
        </template>
        <div class="elpr_div">
            <el-text size="small">0:00</el-text>
            <div class="elpr_div_bar">
                <el-progress :percentage="50" :show-text="false" />
            </div>
            <el-text size="small">0:00</el-text>
        </div>
        <el-row :gutter="10" style="justify-content: space-evenly;margin-top: 20px;">
            <el-col :span="3">
                <el-button type="primary" link>
                    <el-icon size="large">
                        <i class="bi bi-skip-start-circle"></i>
                    </el-icon>
                </el-button>
            </el-col>
            <el-col :span="3">
                <el-button type="primary" link>
                    <el-icon size="large">
                        <i v-if="true" class="bi bi-play-circle"></i>
                        <i v-else class="bi bi-pause-circle"></i>
                    </el-icon>
                </el-button>
            </el-col>
            <el-col :span="3">
                <el-button type="primary" link>
                    <el-icon size="large">
                        <i class="bi bi-skip-end-circle"></i>
                    </el-icon>
                </el-button>
            </el-col>
            <el-col :span="3">
                <el-popover placement="bottom" width="350" :append-to="musicList_appendTo" :visible="musicList_flag">
                    <template #reference>
                        <el-button @click="musicList_flag = !musicList_flag" type="primary" link>
                            <el-icon size="large">
                                <i class="bi bi-music-note-list"></i>
                            </el-icon>
                        </el-button>
                    </template>
                    <ul style="list-style-type: none;" class="music-list">
                        <el-scrollbar height="150px">
                            <li v-for="item in options" :class="{'music_active': item.value === selectedMusic}" @click="selectedMusic = item.value" :key="item.value" :value="item.value">{{ item.label }}</li>
                        </el-scrollbar>
                    </ul>
                </el-popover>
            </el-col>
        </el-row>
    </el-card>
</template>
<style>
.elpr_div {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    justify-content: space-between;
}

.elpr_div_bar {
    width: 75%;
}

.music-list{
    padding: 0;
    margin: 0;
}
.music-list li{
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    margin-bottom: 5px;
}

.music-list li:hover{
    background-color: #f5f5f5;
}

.music_active{
    background-color: #09f !important;
    color: #fff;
}
</style>