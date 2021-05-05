<template>
  <div>
    <NuxtLink to='/app/'>Back</NuxtLink>
    <div v-if='error' class='text-red-600'>
      {{ error }}
    </div>
    <div v-else>
      <div v-if='del_error'>
        <h1 class='float-right text-red-600'>{{ del_error }}</h1>
      </div>
      <div v-else>
        <button @click='delRead' class='float-right'>Delete read</button>
      </div>
      <h1>{{ read.name }}</h1>
      <div v-if='analyze_error' class='text-red-600'>
        {{ analyze_error }}
      </div>
      <div v-else>
        <div v-if='analyzing' class='text-blue-600'>
          <h1>Please don't close or refresh the tab...</h1>
        </div>
        <div v-else>
          <button @click='analyze'>Analyze</button>
        </div>
      </div>
      <NuxtLink :to='"/app/read/" + read_id + "/create-widget"'>Create widget</NuxtLink>
      <div v-if='widgets_error' class='text-red-600'>
        {{ widgets_error }}
      </div>
      <div v-else>
        <div v-for='widget in widgets'>
          <NuxtLink :to='"/app/read/" + read_id + "/widget/" + widget.id'>{{ widget.name }}</NuxtLink>
        </div>
      </div>
    </div>
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
      read: {
        name: ''
      },
      error: '',
      widgets: [],
      widgets_error: '',
      analyzing: false,
      analyze_error: '',
      del_error: '',
    }
  },
  async created() {
    let result;
    try {
      result = await this.$axios.get(server.root + '/read/get/' + this.read_id, {
        headers: {
          'Authorization': this.$auth.strategy.token.get(),
        },
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
    this.read = result.data.read;

    try {
      result = await this.$axios.get(server.root + '/widget/list/' + this.read_id, {
        headers: {
          'Authorization': this.$auth.strategy.token.get(),
        },
      })
    } catch (error) {
      if (error.response) {
        console.log(error.response)
        await this.showWidgetError(error.response.data.error);
      } else {
        await this.showWidgetError("something went wrong");
      }
      return;
    }
    console.log(result)
    this.widgets = result.data.widgets;
  },
  methods: {
    async showError(err) {
      if (err === undefined) {
        this.error = 'something went wrong'
      } else {
        this.error = err;
      }
    },
    async showWidgetError(err) {
      if (err === undefined) {
        this.widgets_error = 'something went wrong'
      } else {
        this.widgets_error = err;
      }
    },
    async showAnalyzeError(err) {
      if (err === undefined) {
        this.analyze_error = 'something went wrong'
      } else {
        this.analyze_error = err;
      }
      await new Promise(r => setTimeout(r, 2000));
      this.analyze_error = '';
    },
    async showDelError(err) {
      if (err === undefined) {
        this.del_error = 'something went wrong'
      } else {
        this.del_error = err;
      }
      await new Promise(r => setTimeout(r, 2000));
      this.del_error = '';
    },
    async delRead() {
      let result;
      try {
        result = await this.$axios.post(server.root + '/read/delete', { read_id: this.read_id }, {
          headers: {
            'Authorization': this.$auth.strategy.token.get(),
          },
        })
      } catch (error) {
        if (error.response) {
          console.log(error.response)
          await this.showDelError(error.response.data.error);
        } else {
          await this.showDelError("something went wrong");
        }
        return;
      }
      console.log(result)
      await this.$router.push('/app/')
    },
    async analyze() {
      this.analyzing = true;
      let result;
      try {
        result = await this.$axios.post(server.root + '/read/parse', {
          read_id: this.read_id,
        }, {
          headers: {
            'Authorization': this.$auth.strategy.token.get(),
          },
          timeout: 0,
        })
      } catch (error) {
        if (error.response) {
          console.log(error.response)
          await this.showAnalyzeError(error.response.data.error);
        } else {
          await this.showAnalyzeError("something went wrong");
        }
        this.analyzing = false;
        return;
      }
      console.log(result)
      this.analyzing = false;
    }
  },
}
</script>
