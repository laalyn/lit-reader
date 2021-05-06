<template>
  <div>
    <NuxtLink :to='"/app/read/" + read_id'>Back</NuxtLink>
    <div v-if='error' class='text-red-600'>
      {{ error }}
    </div>
    <div v-else>
      <div v-if='del_error'>
        <h1 class='float-right text-red-600'>{{ del_error }}</h1>
      </div>
      <div v-else>
        <button @click='delWidget' class='float-right'>Delete widget</button>
      </div>
      <h1>{{ widget.name }}</h1>
      <div v-if='run_error' class='text-red-600'>
        {{ run_error }}
      </div>
      <div v-else>
        <!-- TODO put list result here -->
        <div v-if='list'>
          <h1>{{ result.length }} entr{{ result.length === 1 ? 'y' : 'ies' }}</h1>
          <div v-for='row in result'>
            <p>{{ row[0] }}, {{ row[1] }}</p>
          </div>
        </div>
        <div v-else>
          <div v-if='colors'>
            <button @click='colors = false; reChart(true)'>Turn off colors</button>
          </div>
          <div v-else>
            <button @click='colors = true; reChart(true)'>Turn on colors</button>
          </div>
          <div>
            <canvas id='chart'></canvas>
          </div>
        </div>
        <!-- {{ result }} -->
      </div>
    </div>
  </div>
</template>

<script>
import { server } from '../../../../../server';
import { Chart, registerables } from 'chart.js';
import { randomInt } from 'mathjs';

let colors = [
  // chart.js Utils
  ['#4dc9f6', false],
  ['#f67019', false],
  ['#f53794', false],
  ['#537bc4', false],
  ['#acc236', false],
  ['#166a8f', false],
  ['#00a950', false],
  ['#58595b', false],
  ['#8549ba', false],
  ['rgb(255, 99, 132)', false],
  ['rgb(255, 159, 64)', false],
  ['rgb(255, 205, 86)', false],
  ['rgb(75, 192, 192)', false],
  ['rgb(54, 162, 235)', false],
  ['rgb(153, 102, 255)', false],
  // some other site
  ['#003f5c'],
  ['#2f4b7c'],
  ['#665191'],
  ['#a05195'],
  ['#d45087'],
  ['#f95d6a'],
  ['#ff7c43'],
  ['#ffa600'],
]

const fallback_color = 'rgb(201, 203, 207)';

const chunk_size = 8000; // javascript seriously sucks

export default {
  async asyncData({ params }) {
    const read_id = params.read_id;
    const widget_id = params.widget_id;
    return { read_id, widget_id }
  },
  data() {
    return {
      widget: {
        name: '',
        item: '',
        granularity: '',
      },
      error: '',
      result: null,
      list: false,
      run_error: '',
      chart: null,
      colors: true,
      del_error: '',
    }
  },
  async created() {
    let result;
    try {
      result = await this.$axios.get(server.root + '/widget/get/' + this.widget_id, {
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
    this.widget = result.data.widget;

    try {
      result = await this.$axios.get(server.root + '/widget/run/' + this.widget_id, {
        headers: {
          'Authorization': this.$auth.strategy.token.get(),
        },
      })
    } catch (error) {
      if (error.response) {
        console.log(error.response)
        await this.showRunError(error.response.data.error);
      } else {
        await this.showRunError("something went wrong");
      }
      return;
    }
    console.log(result)
    this.result = result.data.result;

    await this.reChart(false);
  },
  methods: {
    async showError(err) {
      if (err === undefined) {
        this.error = 'something went wrong'
      } else {
        this.error = err;
      }
    },
    async showRunError(err) {
      if (err === undefined) {
        this.run_error = 'something went wrong'
      } else {
        this.run_error = err;
      }
    },
    async showDelError(err) {
      if (err === undefined) {
        this.del_error = 'something went wrong'
      } else {
        this.del_error = err;
      }
      await new Promise(r => setTimeout(r, 2000))
      this.del_error = '';
    },
    async delWidget() {
      let result;
      try {
        result = await this.$axios.post(server.root + '/widget/delete', { widget_id: this.widget_id }, {
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
      await this.$router.push('/app/read/' + this.read_id)
    },
    async reChart(re) {
      // figure out how to plot each type
      if (!this.result.datasets) {
        // this is a list operation, just display everything
        this.list = true;
      } else {
        if (!this.result.datasets.nil) {
          // this is a plot over operation
          console.log("plotting line chart")
          // traverse over datasets
          let datasets = []
          let it = 0;
          for (let d of Object.keys(this.result.datasets)) {
            if (!(it % chunk_size)) {
              console.log('chunking')
              await new Promise(r => setTimeout(r, 0))
            }
            let color = fallback_color;
            if (this.colors) {
              let start_idx = randomInt(0, colors.length - 1);
              color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
              for (let i = 0; i < colors.length; i++) {
                if (!colors[(i + start_idx) % colors.length][1]) {
                  color = colors[(i + start_idx) % colors.length][0];
                  colors[(i + start_idx) % colors.length][1] = true;
                  break;
                }
              }
            }
            let obj = {
              label: d,
              data: this.result.datasets[d],
              backgroundColor: color,
              borderColor: color,
            }
            datasets.push(obj)
            it++;
          }
          // plot scatter if it makes more sense
          let plot_type = 'line', stack = false;
          if (this.widget.item === 'character' && this.widget.granularity === 'interaction') {
            plot_type = 'bar'
            stack = true;
          }
          // show
          Chart.register(...registerables)
          if (re) {
            this.chart.destroy();
          }
          console.log("rendering")
          // TODO: maybe have this chunk too
          this.chart = new Chart('chart', {
            type: plot_type,
            data: {
              labels: this.result.labels,
              datasets: datasets,
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  stacked: stack,
                },
                y: {
                  stacked: stack,
                }
              },
            }
          })
          console.log(this.chart)
          // now reset all colors (important for use with next time)
          for (let i = 0; i < colors.length; i++) {
            colors[i][1] = false;
          }
        } else {
          // this is a plot operation
          console.log("plotting bar chart")
          // create datasets
          let color = fallback_color;
          if (this.colors) {
            color = colors[randomInt(0, colors.length - 1)][0];
          }
          let datasets = [{
            label: this.widget.item === 'character' ? 'Character participation' : 'Word usage',
            data: this.result.datasets.nil,
            backgroundColor: color,
            borderColor: color,
          }]
          // show
          Chart.register(...registerables)
          if (re) {
            this.chart.destroy();
          }
          console.log("rendering")
          this.chart = new Chart('chart', {
            type: 'bar',
            data: {
              labels: this.result.labels,
              datasets: datasets,
            },
            options: {
              responsive: true,
            }
          })
          console.log(this.chart)
        }
      }
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
}
</script>
