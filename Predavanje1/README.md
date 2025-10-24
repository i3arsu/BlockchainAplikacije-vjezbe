- Postavljanje Environmenta (Node.js, npm, Vue)
    - https://nodejs.org/en/download (node)
    
    ```jsx
    npm create vue@latest
    ```
    
- Prolazak kroz strukturu projekta
    
    ```
    src  /
    ├── App.vue                    
    ├── main.js                       #Glavni file
    ├── assets/                       #Slike, datoteke
    │   └── logo.svg
    ├── components/                   #Komponente
    │   ├── HelloWorld.vue
    │   └── WelcomeItem.vue
    ├── router/
    │   └── index.js
    ├── stores/
    │   └── counter.js
    └── views/
        ├── HomeView.vue
        └── AboutView.vue
    ```
    

## Props

Atributi koji se mogu prosljeđivati zajedno sa komponentom!

Primjer kako prosljediti propse s komponentom:

Prvi primjer je ako se koristi Composition API (bolji za reactivity) a drugi ako se koristi Options API interface

### BlogPost.vue

```jsx
<template>
	<h1>{{ title }}</h1>
</template>

<script setup>
defineProps(['title'])
</script> 
```

ili 

```jsx
export default {
	props: ['title'],
	setup(props){
	}
}
```

## Reactivity

- 2 načina reactivitya:
    - Koristeći `ref()` - Wrapper
        
        ```jsx
        
        import { ref } from 'vue'
        
        const count = ref(0)
        ```
        
    - Koristeći `reactive()` - Napravi sami object reactive
        
        ```jsx
        import { reactive } from 'vue'
        
        const state = reactive({ count: 0 })
        ```
        

- Stvaranje reaktivne komponente Counter
    - Prvo unutar `Components` napraviti novi file pod imenom `Counter.vue`
    - Unutar `Counter.vue` napraviti template i script sa logikom za inkrementiranje countera
    - Unutar `views` napraviti novi view pod imenom `CounterView.vue` unutar kojeg će se prikazivati `Counter` komponenta
    - Dodati novi route u `router/index.js` koji void na `CounterView.vue`

## Events

Služe za komunikaciju između parent i child komponenti.

Primjer - Povećanje samo teksta na stranici bez da se druge komponente povećaju

```jsx
<template>
	<h1>{{ title }}</h1>
	<button @click="$emit('enlarge')">Enlarge Text</button>
</template>

<script setup>
	defineProps(['title'])
	defineEmits(['enlarge'])
</script>

```

Za direktno pozivanje emita unutar `<script setup>`:

```jsx
<script setup>
	const emit = defineEmits(['enlarge])
	
	emit('enlarge')
</script>
```

## Samostalan Zadatak:

<aside>
💡

Napraviti stranicu na kojoj će se prikazati counter koji ispod sebe ima znakove za + i - koji će inkrementirati brojku na ekranu.  Prilikom pritiska na gumb inkrementa biti će emitana poruka koja će se ispisati u konzoli preglednika s porukom “Inkrementirano” i “Dekrementirano”

**Opcionalno**: Koristiti **store** za state management (Pinia ili Vuex) i implementirati Inicijalnu vrijednost countera (inicijalizira se pri stvaranju)

</aside>

### Counter.vue (Pinia State)

```jsx
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
```

### counter.js (Pinia store)

```jsx
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
	function increment() {
	    count.value++  
	}
	function decrement() {
		count.value--
		}

  return { count, doubleCount, increment, decrement }
})
```

### CounterView.vue

```jsx
<template>
    <div class="counter-view">
        <Counter />
    </div>
</template>

<script setup>
import Counter from '../components/Counter.vue'
</script> 
```

### router/index.js

```jsx
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },{
      path: '/counter',
      name: 'counter',
      component: () => import('../views/CounterView.vue'),
    },
  ],
})

export default router
```
