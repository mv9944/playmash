<script setup lang="ts">
</script>

<template>
  <header>
    <img alt="Vue logo" src="@/assets/logo.svg" className="size-8" />

    <div>
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>
