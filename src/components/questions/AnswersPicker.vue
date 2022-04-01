<template>
  <div
    class="span-2"
    style="
      border-left: 2px dotted rgba(0, 0, 0, 0.2);
      margin-bottom: 30px;
      padding-top: 10px;
    "
  >
    <v-radio-group
      :value="selected"
      hide-details
      :rules="[answerRule]"
      @change="$emit('selected', $event)"
    >
      <div v-for="(option, key) in options" :key="key" class="flex-row">
        <div class="h-dots" />
        <v-radio style="margin-top: 7px" />
        <v-textarea
          v-model="options[key]"
          :label="'Option ' + (key + 1)"
          outlined
          :readonly="!canPick"
          :rules="[(v) => !!v || 'Enter a valid answer']"
          auto-grow
          rows="1"
          placeholder="Write an Answer here"
          persistent-placeholder
          dense
        />
        <v-btn v-if="canPick && options.length > 1" icon color="red" @click="removeAnswer(key)">
          <v-icon>mdi-minus-circle</v-icon>
        </v-btn>
      </div>
    </v-radio-group>

    <div class="flex-row" style="position: relative">
      <div class="h-dots" />
      <v-btn
        text
        class="add-btn"
        color="primary"
        :disabled="!canPick"
        @click="addOption"
      >
        <v-icon style="margin-right: 10px">mdi-plus-circle</v-icon>
        Add Option
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnswersPicker',

  model: {
    prop: 'options',
    event: 'options'
  },

  props: {
    selected: {
      type: Number,
      default: null
    },
    pickerType: {
      type: String,
      default: null
    },
    options: {
      type: Array,
      default: () => []
    }
  },

  watch: {
    pickerType() {
      if (this.pickerType === 'bool') {
        this.$emit('options', ['True', 'False']);
      } else if (this.pickerType === 'choices' && this.options && this.options.length > 0) {
        this.$emit('options', [...this.options]);
      } else {
        this.$emit('options', ['','','','']);
      }

      this.canPick = this.pickerType === 'choices';
    }
  },

  data: () => ({
    canPick: false
  }),

  methods: {
    answerRule(v) {
      return typeof v === 'number' || 'No answer is marked as correct';
    },
    addOption() {
      const options = [...this.options, ''];
      this.$emit('options', options);
    },
    removeAnswer(index) {
      this.options.splice(index, 1);
      this.$emit('options', this.options);
    }
  }
};
</script>

<style lang="sass" scoped>
.add-btn
  position: absolute

.flex-row
  display: flex
  align-items: flex-start

.h-dots
  border-top: 2px dotted rgba(0, 0, 0, .2)
  width: 15px
  margin-top: 18px
</style>

<style lang="sass">
//.modified-message > .v-messages__message
//  text-align: center !important

.add-btn
  position: absolute

.flex-row
  display: flex
  align-items: flex-start

.h-dots
  border-top: 2px dotted rgba(0, 0, 0, .2)
  width: 15px
  margin-top: 18px
</style>
