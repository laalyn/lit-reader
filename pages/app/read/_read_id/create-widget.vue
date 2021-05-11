<template>
  <div class='px-2 py-2'>
    <NuxtLink :to='"/app/read/" + read_id'>Back</NuxtLink>
    <form @submit.prevent>
      <input v-model='form.name' type='text' placeholder='Widget name' class='block'>
      <select v-model='form.action'>
        <option disabled value=''>Query action</option>
        <option value='plot'>Plot</option>
        <option value='plot over'>Plot over</option>
        <option value='list'>List</option>
      </select>
      <select v-model='form.item'>
        <option disabled value=''>Query entity</option>
        <option value='character'>Character</option>
        <option value='word'>Word</option>
      </select>
      <div v-if='form.action === "plot over"' class='inline-block'>
        <div v-if='form.item === "character"'>
          <select v-model='form.granularity'>
            <option disabled value=''>Plot granularity</option>
            <option value='act'>Act</option>
            <option value='scene'>Scene</option>
            <option value='interaction'>Interaction</option>
          </select>
        </div>
        <div v-else-if='form.item !== ""'>
          <select v-model='form.granularity'>
            <option disabled value=''>Plot granularity</option>
            <option value='act'>Act</option>
            <option value='scene'>Scene</option>
            <option value='interaction'>Interaction</option>
            <option value='paragraph'>Paragraph</option>
            <option value='line'>Line</option>
          </select>
        </div>
      </div>
      <select v-model='form.sort' class='inline-block'>
        <option disabled value=''>Sort order</option>
        <option :value='null'>None</option>
        <option value='asc'>Ascending</option>
        <option value='desc'>Descending</option>
      </select>
      <br>
      <div v-if='form.action !== "plot" && form.action !== ""' class='inline-block'>
        <input v-model='form.match_s' type='text' placeholder='Match input'>
      </div>
      <div v-if='form.action === "list"' class='inline-block'>
        <input v-model.number='form.match_i' type='number' placeholder='Match output'>
      </div>
      <input v-model.number='form.take' type='number' placeholder='Take count' class='inline-block'>
      <div v-if='error' class='text-red-600'>
        {{ error }}
      </div>
      <div v-else>
        <button @click='submit'>Create widget</button>
      </div>
    </form>
    <!--<h1>{{ form }}</h1>-->
  </div>
</template>

<script>
import { server } from '../../../../server';

export default {
  async asyncData({ params }) {
    const read_id = params.read_id;
    return { read_id }
  },
  data() {
    return {
      form: {
        name: '',
        action: '',
        item: '',
        granularity: '',
        from_all: true, // always true for now
        sort: '', // will be set to null later
        match_s: null,
        match_i: null,
        take: null,
        read_id: '',
      },
      error: '',
    }
  },
  async created() {
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
      if (!this.form.name) {
        this.form.name = '_untitled';
      }
      if (!this.form.sort) {
        this.form.sort = null;
      }
      if (!this.form.match_s) {
        this.form.match_s = null;
      }
      if (!this.form.match_i) {
        this.form.match_i = null;
      }
      if (!this.form.take) {
        this.form.take = null;
      }
      if (!this.form.read_id) {
        this.form.read_id = this.read_id;
      }

      let result;
      try {
        result = await this.$axios.post(server.root + '/widget/create', { widget: this.form }, {
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
      await this.$router.push('/app/read/' + this.read_id + '/widget/' + result.data.widget_id)
    },
  },
}
</script>
