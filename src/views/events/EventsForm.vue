<template>
  <div class="d-flex flex-nowrap flex-column grey lighten-3 elevation-1">
    <v-form ref="form">
      <div class="d-flex white pa-4 elevation-1">
        <div>
          <v-text-field v-model="myEvent.name" label="Name" :rules="[required()]" dense outlined/>
        </div>
        <v-spacer/>
        <v-btn @click="submit" color="primary">Submit</v-btn>
      </div>
      <div class="d-flex flex-md-row flex-column flex-grow-1">
        <div class="col-12 col-md-3 pa-0 white" style="min-width: 300px;">
          <div style="min-width: 280px">
            <!-- Trigger Setup-->
            <div v-if="!triggerSelected" class="text-h6 grey lighten-1 pa-3">Trigger Setup</div>
            <div v-if="!triggerSelected" class="text-subtitle-1 pa-3">
              {{ nodes[0].data.configureText ? nodes[0].data.configureText : 'What will trigger this event?' }}
            </div>
            <div v-if="errors.length > 0" class="py-3">
              <ul class="red--text" v-for="(error, i) in errors" :key="i">
                <li>{{ error }}</li>
              </ul>
            </div>
            <div v-if="!configureTrigger && !triggerSelected" class="px-4">
              <FlowyNewBlock
                  v-for="(block, index) in triggerBlocks"
                  :key="index"
                  @drag-start="onDragStartNewBlock"
                  @drag-stop="onDragStopNewBlock"
              >
                <template v-slot:preview="{}">
                  <TriggerBlock
                      :block="block"
                      @setup-trigger="setupTrigger"
                  />
                </template>
                <template v-slot:node="{}">
                  <trigger-node
                      @configure="configure"
                  />
                </template>
              </FlowyNewBlock>
            </div>
            <div v-else-if="configureTrigger" class="px-4">
              <v-form ref="formTrigger" class="form-div">
                <v-select
                    :rules="[required()]"
                    v-if="nodes[0].data.type === 3"
                    outlined
                    dense
                    v-model="gameMode"
                    :items="gameModes"
                    item-text="label"
                    :value-comparator="(a, b) => a && b && a === b"
                    :item-value="(item) => item.value" label="Game Mode"
                />
                <v-text-field type="number" :rules="[required()]" v-model="value" outlined
                              :label="nodes[0].data.configureTextfieldText" dense></v-text-field>
                <div>
                  <v-btn class="primary" @click="saveTrigger">Save</v-btn>
                  <v-btn @click="cancelTrigger">Cancel</v-btn>
                </div>
              </v-form>
            </div>
            <div v-if="triggerSelected">
              <div class="text-h6 font-bold pa-3">Actions</div>
              <div class="px-4">
                <FlowyNewBlock
                    v-for="(block, index) in actionBlocks"
                    :key="index"
                    @drag-start="onDragStartNewBlock"
                    @drag-stop="onDragStopNewBlock"
                >
                  <template v-slot:preview="{}">
                    <ActionBlock
                        :block="block"
                    />
                  </template>
                  <template v-slot:node="{}">
                    <notification-node
                        v-if="block.node.type === 0"
                        :title="block.node.title"
                        :description="block.node.description"
                        :child="block.node.child"
                        :type="block.node.type"
                        :node="block.node"
                    />
                    <time-node
                        v-else-if="block.node.type === 1"
                        :title="block.node.title"
                        :description="block.node.description"
                        :child="block.node.child"
                        :type="block.node.type"
                        :node="block.node"
                    />
                    <!--                  <conditional-node-->
                    <!--                      v-else-if="block.node.type === 2"-->
                    <!--                      :title="block.node.title"-->
                    <!--                      :description="block.node.description"-->
                    <!--                      :child="block.node.child"-->
                    <!--                      :type="block.node.type"-->
                    <!--                      :node="block.node"-->
                    <!--                  />-->
                  </template>
                </FlowyNewBlock>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-9" style="min-width: auto;">
          <flowy
              class="h-full"
              style="min-width: 100%; max-width: 100%"
              :nodes="nodes"
              @drag-start="onDragStart"
              @add="add"
              @move="move"
              @remove="remove"
              :beforeAdd="beforeAdd"
              :beforeMove="beforeMove"
              :onEnterDragFn="onEnter"
          ></flowy>
        </div>
      </div>
    </v-form>
    <v-dialog v-model="loading" width="50%">
      <v-card class="d-flex justify-center align-center" style="min-height: 200px">
        <v-progress-circular indeterminate/>
        <p class="ma-0">Loading ...</p>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';

import TriggerNode from "@/flowy/TriggerNode";
import TriggerBlock from "@/flowy/TriggerBlock";
import ActionBlock from "@/flowy/ActionBlock";
import {required} from '@/utils/validators';
import TimeNode from "@/flowy/TimeNode";
import NotificationNode from "@/flowy/NotificationNode";
// import {test} from "@/plugins/firebase";
import {EventService} from "@/services/events-service";


Vue.component('trigger-node', TriggerNode)
Vue.component('time-node', TimeNode)
Vue.component('notification-node', NotificationNode)
export default {
  name: 'EventsForm',
  components: {
    ActionBlock,
    TriggerBlock,
    TimeNode,
    NotificationNode
  },
  data: () => ({
    service: new EventService(),
    errors: [],
    holder: [],
    dragging: false,
    value: null,
    triggerSelected: false,
    configureTrigger: false,
    loading: false,
    isEdit: false,
    gameModes: [
      {
        label: 'Endless Mode',
        value: 'ENDLESS_MODE_PLAY_TAPPED'
      },
      {
        label: 'Time Mode',
        value: 'TIMED_MODE_PLAY_TAPPED'
      },
      {
        label: 'Review Mode',
        value: 'REVIEW_MODE_PLAY_TAPPED'
      },
      {
        label: 'Adaptive QBank Mode',
        value: 'ADAPTIVE_Q_BANK_PLAY_TAPPED'
      },
      {
        label: 'Multiplayer Mode',
        value: 'MULTI_PLAYER_TAPPED'
      },
    ],
    gameMode: null,
    new: true,
    myEvent: {
      name: null,
      nodes: null,
    },
    triggerBlocks: [
      {
        preview: {
          title: 'Correct Answers',
          description: 'Triggers when somebody answers a certain no. of questions',
          icon: 'mdi-message-question-outline',
        },
        node: {
          type: 0,
          child: 0,
          selected: false,
          title: 'Trigger',
          description: 'Triggers when somebody answers a certain no. of questions',
          configureText: 'Configure Correct Answer Trigger',
          configureTextfieldText: 'No. of Questions'
        },
      },
      {
        preview: {
          title: 'Wrong Answers',
          description: 'Triggers when somebody gives wrong answers to a certain no. of questions',
          icon: 'mdi-message-question-outline',
        },
        node: {
          type: 1,
          child: 0,
          selected: false,
          title: 'Trigger',
          description: 'Triggers when somebody gives wrong answers to a certain no. of questions',
          configureText: 'Configure Wrong Answer Trigger',
          configureTextfieldText: 'No. of Questions'
        },
      },
      {
        preview: {
          title: 'Compete for Badge',
          description: 'Triggers when somebody competes for a badge.',
          icon: 'mdi-crown',
        },
        node: {
          type: 2,
          child: 0,
          selected: false,
          title: 'Trigger',
          description: 'Triggers when somebody competes for a badge certain no. of times.',
          configureText: 'Configure Compete for Badge Trigger',
          configureTextfieldText: 'No. of times'
        },
      },
      {
        preview: {
          title: 'Game Mode',
          description: 'Triggers when somebody plays a particular game mode for certain time.',
          icon: 'mdi-eye',
        },
        node: {
          type: 3,
          child: 0,
          selected: false,
          title: 'Trigger',
          description: 'Triggers when somebody plays a particular game mode for certain time.',
          configureText: 'Configure Game Mode Trigger',
          configureTextfieldText: 'No. of Times Played'
        },
      },
    ],
    actionBlocks: [
      {
        preview: {
          title: 'Notification',
          icon: 'mdi-bell-outline',
        },
        node: {
          type: 0,
          notification: null,
          title: 'Send Notification',
          description: 'A notification will be sent.',
          child: 0
        },
      },
      {
        preview: {
          title: 'Time Delay',
          icon: 'mdi-clock-outline',
        },
        node: {
          type: 1,
          timeDelay: 0,
          timeType: {
            label: 'Day(s)',
            value: 'day'
          },
          title: 'Configure Time Delay',
          description: 'Wait for given amount of time',
          child: 0
        },
      },
      // {
      //   preview: {
      //     title: 'Conditional Split',
      //     icon: 'mdi-arrow-split-vertical',
      //   },
      //   node: {
      //     type: 2,
      //     condition: null,
      //     title: 'Conditional Split',
      //     description: 'Do either this or that!',
      //     child: 0
      //   },
      // },
    ],
    previousTrigger: null,
    nodes: [
      {
        id: 1,
        parentId: -1,
        nodeComponent: 'trigger-node',
        data: {
          type: -1,
          child: 0,
          title: 'Trigger',
          description: 'Select a event trigger on the left to get started.',
          configureText: 'What will trigger this Event?',
          configureTextfieldText: '',
          selected: true,
        },
      },
    ]
  }),
  mounted() {
    this.loadEvent()
  },
  methods: {
    required,
    async loadEvent() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.myEvent = await this.service.fetchOne(this.$route.query.id);
      this.nodes = this.myEvent.nodes
      if (this.nodes.length > 1)
        this.triggerSelected = true
      this.loading = false;
    },
    async submit() {
      const form = this.$refs.form;
      this.errors = []
      if (this.triggerSelected) {
        if (this.nodes.length > 1) {
          if (form.validate()) {
            this.loading = true
            this.myEvent.nodes = this.nodes
            if (this.isEdit) {
              try {
                await this.service.update(this.myEvent);
                this.loading = false
              } catch (e) {
                this.errors.push(e)
                this.loading = false
              }
              this.$router.back()
            } else {
              try {
                await this.service.create(this.myEvent);
                this.loading = false
              } catch (e) {
                this.errors.push(e)
                this.loading = false
              }
              this.$router.back()
            }
          }
        } else {
          this.errors.push('At least one action is required')
          this.loading = false
        }
      } else {
        this.errors.push('Trigger Configuration is required')
        this.loading = false
      }
    },
    setupTrigger(event) {
      this.configureTrigger = true
      this.previousTrigger = this.nodes[0].data
      this.nodes[0].data = event.node
      this.nodes[0].data.selected = true
    },
    saveTrigger() {
      if (this.$refs.formTrigger.validate()) {
        let desc
        if (this.nodes[0].data.type === 0) {
          desc = 'Triggers when somebody answers ' + this.value + ' questions'
          this.nodes[0].data.description = desc
          this.nodes[0].data.trigger = 'WRONG_ANSWER_TAPPED'
          this.nodes[0].data.value = this.value
        } else if (this.nodes[0].data.type === 1) {
          desc = 'Triggers when somebody gives wrong answers to ' + this.value + ' questions'
          this.nodes[0].data.description = desc
          this.nodes[0].data.trigger = 'CORRECT_ANSWER_TAPPED'
          this.nodes[0].data.value = this.value
        } else if (this.nodes[0].data.type === 2) {
          desc = 'Triggers when somebody competes for a badge ' + this.value + ' no. of times'
          this.nodes[0].data.description = desc
          this.nodes[0].data.trigger = 'COMPETE_FOR_BADGE'
          this.nodes[0].data.value = this.value
        } else {
          desc = 'Triggers when somebody plays ' + this.gameMode.label + ' Mode ' + this.value + ' times'
          this.nodes[0].data.description = desc
          this.nodes[0].data.trigger = this.gameMode
          this.nodes[0].data.value = this.value
        }
        this.nodes[0].data.selected = false
        this.errors = []
        this.configureTrigger = false
        this.triggerSelected = true
      }
    },
    cancelTrigger() {
      this.nodes[0].data = this.previousTrigger
      this.nodes[0].data.selected = false
      this.configureTrigger = false
    },
    onDragStartNewBlock(event) {
      // contains all the props and attributes passed to trigger-node
      const {props} = event
      this.newDraggingBlock = props;
    },
    onDragStopNewBlock() {
      this.newDraggingBlock = null;
    },
    // REQUIRED
    beforeMove({to, from}) {
      // called before moving node (during drag and after drag)
      // indicator will turn red when we return false
      // from is null when we're not dragging from the current node tree

      // we cannot drag upper parent nodes in this demo
      if (from && from.parentId === -1) {
        return false;
      }
      // we're adding a new node (not moving an existing one)
      if (from === null) {
        // we've passed this attribute to the trigger-node
        if (this.newDraggingBlock['custom-attribute'] === false) {
          return false
        }
        if (to.data.type === 2) {
          if (to.data.child >= 2) {
            this.new = false
            return false
          }
        } else {
          if (to.data.child > 0) {
            this.new = false
            return false
          }
        }
      }

      return true;
    },
    onEnter() {
      window.console.log('ON Enter')
    },
    beforeAdd({to, from}) {
      // called before moving node (during drag and after drag)
      // indicator will turn red when we return false
      // from is null when we're not dragging from the current node tree
      window.console.log('beforeAdd', to, from);

      // we've passed this attribute to the trigger-node
      if (this.newDraggingBlock['custom-attribute'] === false) {
        return false
      }

      if (!this.new) {
        this.new = true
        return false
      }

      return true;
    },
    randomInteger() {
      return Math.floor(Math.random() * 10000) + 1;
    },
    generateId(nodes) {
      let id = this.randomInteger();
      // _.find is a lodash function
      while (_.find(nodes, {id}) !== undefined) {
        id = this.randomInteger();
      }
      return id;
    },
    addNode(_event) {
      const id = this.generateId();
      this.nodes.push({
        ..._event.node,
        id,
      });
    },
    remove(event) {
      if (confirm('This Item will be deleted.')) {
        // node we're dragging to
        const {node} = event
        // we use lodash in this demo to remove node from the array
        const nodeIndex = _.findIndex(this.nodes, {id: node.id});
        const childIndex = nodeIndex + 1;
        const parentIndex = node.parentId;
        if (!this.nodes[childIndex]) {
          this.nodes[_.findIndex(this.nodes, {id: node.parentId})].data.child -= 1
        }
        if (this.nodes[childIndex] && this.nodes[childIndex].parentId === node.id) {
          this.nodes[childIndex].parentId = parentIndex;
        }
        if (this.nodes[childIndex + 1] && this.nodes[childIndex + 1].parentId === node.id && this.nodes[parentIndex].data.type === 2) {
          this.nodes[childIndex + 1].parentId = parentIndex;
        }
        this.nodes.splice(nodeIndex, 1);
      }
    },
    configure(event) {
      window.console.log(event)
    },
    move(event) {

      // node we're dragging to and node we've just dragged
      const {dragged, to} = event;

      // change parentId to id of node we're dragging to
      dragged.parentId = to.id;
    },
    add(event) {
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].id === event.node.parentId) {
          this.nodes[i].data.child += 1
        }
      }
      this.new = true
      // every node needs an ID
      const id = this.generateId();

      // add to array of nodes
      this.nodes.push({
        id,
        ...event.node,
      });
    },
    onDragStart(event) {
      window.console.log('onDragStart', event);
      this.dragging = true;
    },
  },
};
</script>

<style lang="scss">
.h-screen {
  height: 100vh;
}

.w-screen {
  width: 100vw;
}

.h-full {
  height: 100%;
}

.w-full {
  width: 100%;
}

.flowy-drag-handle button {
  cursor: grab;
}

.flowy-block.draggable-mirror {
  opacity: 0.6;
}

</style>
