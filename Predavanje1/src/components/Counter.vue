<template>
    <div>
        <h1>Counter: {{ counter }}</h1>
        <button @click="doubleCount">Double Count</button>
        <button @click="decrement">Decrement</button>
        <button @click="increment">Increment</button>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    initialCount: {
        type: Number,
        default: 0
    }
})

const counter = ref(0)
counter.value = props.initialCount

function increment() {
    counter.value++
}
function decrement() {
    counter.value--
}

function doubleCount() {
    counter.value = counter.value * 2
}

</script>

<style scoped>
button {
    margin: 0 5px;
    padding: 5px 10px;
    font-size: 16px;
}
</style>