<template>
    <div class="user-color-card-main" :style="{ backgroundColor: props.BodyColor }">
        <div class="card-body">
            <div class="card_backImg" :style="{ backgroundImage: `url(../../../public/img/vc2.png)` }"></div>
            <div class="user_avatar_box">
                <img src="../../../public/img/vc2.png" width="100px" alt="">
            </div>
            <div class="user_info_box">
                <p class="user_name">久池鸢里<i v-if="patchCheck" class="bi bi-patch-check-fill"></i></p>
                <p class="user_uid">UID:103354228</p>
                <div class="user_tab">
                    <div class="user_tab_item"><i class="bi bi-gender-female"></i>天蝎座</div>
                    <div class="user_tab_item">Web前端设计师</div>
                </div>
            </div>
        </div>
        <div class="card-footer" :style="{ backgroundColor: props.FooterColor }">
            <!-- <slot></slot> -->
            <div class="card_footer_icon">
                <i class="bi bi-github"></i>
                <i class="bi bi-twitter-x"></i>
                <i class="bi bi-twitch"></i>
                <i class="bi bi-telegram"></i>
                <i class="bi bi-instagram"></i>
                <i class="bi bi-wechat"></i>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, defineProps } from 'vue';
const props = defineProps({
    BodyColor: {
        type: String,
        default: '#FFB0CB'
    },
    FooterColor: {
        type: String,
        default: '#FFE5F9'
    }
});

const patchCheck = ref(true);
</script>
<style scoped>
.user-color-card-main {
    padding: 10px;
    border-radius: 5px;
    position: relative;
    overflow: hidden;
    background-image: linear-gradient(90deg, #FF9AC6, #B0DDFE);
}

.card_backImg{
    position: absolute;
    width: 35%;
    right: 0;
    top: 0;
    height: 100%;
    background-size: cover;
    background-position: center;
    mask: linear-gradient(to right, transparent 0%, hsla(0, 0%, 0%, 0.3)  100%);
}

.card-body {
    padding: 10px;
    display: flex;
    align-items: center;
    margin-bottom: 40px;
}

.user_info_box {
    margin-left: 10px;
    color: #FFF;
}
.user_info_box p{
    margin: 3px 0px;
}
.user_name{
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
}
.user_name i{
    margin-left: 5px;
    font-size: 18px;
    background-image: linear-gradient(-45deg,#FFE5F9,#B0DDFE);
    background-clip: text;
    color: transparent;
}
.user_uid,
.user_tab,.user_tab_item{
    font-size: 14px;
    font-weight: 100 !important;
}
.user_tab{
    display: flex;
}
.user_tab_item{
    font-size: 12px;
    background-color: #a1d1feb3;
    display: flex;
    align-items: center;
    width: fit-content;
    padding: 2px 8px;
    border-radius: 15px;
    margin-right: 5px;
}
.user_tab_item i{
    margin-right: 3px;
    color: #FF9AC6;
}

.user_avatar_box {
    border-radius: 50%;
    width: 100px;
    height: 100px;
    border: 5px solid #FFF;
    overflow: hidden;
}

.card-footer {
    padding: 10px 0px;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
}
.card_footer_icon{
    margin: 0px 5px;
    float: right;
}
.card_footer_icon i{
    margin: 5px 10px;
    color: #B7B6FF;
}
</style>