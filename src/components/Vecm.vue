<script setup>
import VersionCalendar from '@/components/more/VersionCalendar.vue';
import UserColorCard from '@/components/more/userColorCard.vue';
import { ref } from 'vue';

const version = ref([
    {
        start: '2026-03-18',
        end: '2026-04-28',
        content: '新潮起-故渊离',
    },
    {
        start: '2026-03-26',
        end: '2026-05-28',
        content: '拓影丰碑',
    },
    {
        start: '2026-04-09',
        end: '2026-05-28',
        content: '共鸣者前瞻',
        background:'img/bck1.png'
    },
    {
        start: '2026-04-08',
        end: '2026-04-20',
        content: '理智补偿',
    },
]);
</script>
<template>
    <VersionCalendar :version="version" title="明日方舟终末地 / 鸣潮版本日历" />
    <UserColorCard style="margin-top: 20px; width: 445px;"/>
</template>
<style></style>