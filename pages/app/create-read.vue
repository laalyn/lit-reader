<template>
  <div>
    <NuxtLink to='/app/'>Back</NuxtLink>
    <form @submit.prevent>
      <input v-model='form.read.name' type='text' placeholder='Read name'>
      <input v-model='form.source_url' type='url' placeholder='Literature URL' class='block'>
      <select v-model='form.read.type'>
        <option disabled value=''>Literature type</option>
        <option value='play'>Play</option>
      </select>
      <select v-model='parser'>
        <option disabled value=''>Parser config</option>
        <option value='mit'>shakespeare.mit.edu</option>
      </select>
      <div v-if='error' class='text-red-600'>
        {{ error }}
      </div>
      <div v-else>
        <button @click='submit'>Create read</button>
      </div>
    </form>
  </div>
</template>

<script>
import { server } from '../../server';

const mit_parser_config = [{ "type": "act", "match": [[{ "type": "html", "value": "h3" }], [{ "type": "text", "value": "ACT" }]] }, { "type": "scene", "match": [[{ "type": "html", "value": "h3" }], [{ "type": "text", "value": "SCENE" }, { "type": "text", "value": "PROLOGUE" }]] }, { "type": "character", "match": [[{ "type": "html", "value": "a" }], [{ "type": "html", "value": "b" }]] }, { "type": "interaction", "match": [[{ "type": "html", "value": "blockquote" }], [{ "type": "html", "value": "a" }]] }, { "type": "control", "match": [[{ "type": "html", "value": "blockquote" }], [{ "type": "html", "value": "p" }, { "type": "html", "value": "i" }], [{ "type": "html", "value": "i" }, { "type": "text", "value": null }]] }]

export default {
  data() {
    return {
      form: {
        read: {
          type: '',
          name: '',
        },
        source_url: '',
        configs: [],
      },
      parser: '',
      error: '',
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
      if (!this.form.read.name) {
        this.form.read.name = '_untitled';
      }
      if (this.parser === 'mit') {
        this.form.configs = mit_parser_config;
      }

      let result;
      try {
        result = await this.$axios.post(server.root + '/read/create', this.form, {
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
      await this.$router.push('/app/read/' + result.data.read_id)
    }
  },
}
</script>
