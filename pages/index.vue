<template>
  <div class='px-2'>
    <div v-if='this.$auth.loggedIn'>
      <NuxtLink to='/app'>App</NuxtLink>
    </div>
    <div v-else>
      <NuxtLink to='/login'>Login</NuxtLink>
      <NuxtLink to='/register'>Register</NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  auth: false,
};
</script>
