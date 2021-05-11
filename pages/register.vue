<template>
  <div class='px-2'>
    <NuxtLink to='/'>Back</NuxtLink>
    <form @submit.prevent>
      <input v-model='form.email' type='email' placeholder='Email'>
      <input v-model='form.password' type='password' placeholder='Password'>
      <input v-model='form_v.pass_confirm' type='password' placeholder='Confirm Password'>
      <div v-if='error' class='text-red-600'>
        {{ error }}
      </div>
      <div v-else>
        <button @click='submit'>Register</button>
      </div>
    </form>
  </div>
</template>

<script>
import { server } from '../server';

export default {
  auth: false,
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      form_v: {
        pass_confirm: '',
      },
      error: '',
    };
  },
  async beforeCreate() {
    if (this.$auth.loggedIn) {
      await this.$router.replace('/app');
    }
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
    async submit() {
      if (this.form.password !== this.form_v.pass_confirm) {
        await this.showError("password confirmation doesn't match")
        return;
      }

      let result;
      try {
        result = await this.$axios.post(server.root + '/user/create', { user: this.form });
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

      try {
        result = await this.$auth.loginWith('local', { data: { user: this.form } });
      } catch (error) {
        console.log(error.response);
        await this.showError(error.response.data.error)
        return;
      }
      console.log(result);
      await this.$router.push('/app');
    },
  },
};
</script>
