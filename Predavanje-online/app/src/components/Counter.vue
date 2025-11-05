<template>
    <div>
        <h2>Counter: {{ counterStore.count }}</h2>
        <button @click="counterStore.decrement">-</button>
        <button @click="counterStore.increment">+</button>
    </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()
</script>

<style scoped>
button {
    margin: 0 5px;
    padding: 5px 10px;
    font-size: 16px;
}
</style>