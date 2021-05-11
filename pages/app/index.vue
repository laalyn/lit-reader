<template>
  <div class='px-2'>
    <button @click='logout' class='block'>Logout</button>
    <NuxtLink to='/app/create-read'>Create read</NuxtLink>
    <div v-if='error' class='text-red-600'>
      {{ error }}
    </div>
    <div v-else>
      <div v-for='read in reads'>
        <NuxtLink :to='"/app/read/" + read.id'>{{ read.name }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
import { server } from '../../server';

export default {
  data() {
    return {
      reads: [],
      error: '',
    }
  },
  async beforeCreate() {
    let result;
    try {
      result = await this.$axios.get(server.root + '/read/list', {
        headers: {
          'Authorization': this.$auth.strategy.token.get(),
        }
      })
    } catch (error) {
      if (error.response) {
        console.log(error.response)
        await this.showError(error.response.data.error);
      } else {
        await this.showError("something went wrong");
      }
      return;
    }
    console.log(result)
    this.reads = result.data.reads;
  },
  methods: {
    async showError(err) {
      if (err === undefined) {
        this.error = 'something went wrong'
      } else {
        this.error = err;
      }
      await new Promise(r => setTimeout(r, 2000));
      this.error = '';
    },
    async logout() {
      await this.$auth.logout();
      await this.$router.push('/');
    }
  }
}
</script>
