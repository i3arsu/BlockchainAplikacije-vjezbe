<template>
    <div class="about-item">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
    </div>
</template>

<script setup>
defineProps({
    title: {    
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});
</script>