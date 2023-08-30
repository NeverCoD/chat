<template>
  <div class="card" id="chat2">
    <div class="card-header custom-card-header">
      <img
        src="../assets/ridebot.gif"
        alt="avatar 2"
        class="rounded-circle custom-rounded-circle"
      />
      <h5 class="mb-0">Chatbot</h5>
    </div>
    <div
      class="card-body chat-body"
      data-mdb-perfect-scrollbar="true"
      ref="chatBody"
    >
      <div
        v-for="(message, index) in reversedLog" 
        :key="index"
        :class="[
          'd-flex',
          'flex-row',
          'message-container',
          message.role === 'user'
            ? 'justify-content-end user-message bounce-out-enter-active'
            : 'justify-content-start bot-messsage',
        ]"
      >
        <img
          v-if="message.role === 'bot'"
          src="../assets/ridebot.png"
          alt="avatar 2"
          class="rounded-circle"
        />
        <div>
          <p
            class="small p-3 py-2 ms-3 mb-1 rounded-4"
            :style="
              message.role === 'user'
                ? 'background: #f6f6f6;  color: black; max-width: 300px;'
                : 'background: linear-gradient(45deg, #094fa3, #2b74b8);  color: white; ; '
            "
          >
            {{ message.content }}
          </p>
        </div>
        <img
          v-if="message.role === 'user'"
          src="../assets/customerIcon.png"
          alt="avatar 1"
          class="rounded-circle"
        />
      </div>
      <div class="down-btn" v-if="isScrollDownButtonVisible">
        <button @click="scrollToBottomSmooth();" >
          <i
            class="fa-solid fa-angles-down fa-beat-fade fa-xl"
            style="color: #000000"
          ></i>
        </button>
      </div>
    </div>

    <div
      class="card-footer text-muted d-flex justify-content-start align-items-center p-3 bg-white"
    >
      <textarea
        class="form-control form-control-xl"
        id="exampleFormControlInput3"
        placeholder="Talk to me here &#128522; "
        rows="3"
        v-model="input"
        :disabled="isBotMessageLoading || isUserTyping"
        @keyup.enter="submitForm"
      ></textarea>
      <button
        id="input-btn"
        @click="isBotMessageLoading ? stopLoading() : submitForm()"
        :disabled="isUserTyping"
        :style="
          isBotMessageLoading
            ? 'background-color: #ffffff;'
            : 'background-color: #ffffff;'
        "
      >
        <i
          v-if="isBotMessageLoading"
          class="fa-regular fa-circle-stop fa-lg"
          style="color: #ff0000"
        ></i>
        <i
          v-else-if="input.trim() == ''"
          class="fas fa-paper-plane"
          style="color: #d5d5d5"
        ></i>
        <i
          v-else-if="input.trim() !== ''"
          class="fas fa-paper-plane"
          style="color: #094fa3"
        ></i>
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Configuration, OpenAIApi } from "openai";

export default defineComponent({
  name: "ChatBox",
  data() {
    return {
      input: "",
      response: "",
      log: [],
      messages: [],
      isLoading: false,
      isBotMessageVisible: true,
      isUserTyping: false,
      isScrollDownButtonVisible: false,
    };
  },
  mounted() {
    const chatBody = this.$refs.chatBody;
  this.isScrollDownButtonVisible =
    chatBody.scrollTop < chatBody.scrollHeight - chatBody.clientHeight;
  chatBody.addEventListener("scroll", this.updateScrollDownButtonVisibility);
  },
  beforeUnmount() {
    const chatBody = this.$refs.chatBody;
    chatBody.removeEventListener(
      "scroll",
      this.updateScrollDownButtonVisibility
    );
  },
  computed: {
    reversedLog() {
      return this.log.slice();
    },
    isBotMessageLoading() {
      return this.isLoading && !this.isUserTyping;
    },
  },
  methods: {
    initializeChat() {
      this.input =
        "you are chat bot under parknshop , you should say some welcome and use friendly tone ";
      this.completionCall(this.input).then(() => {
        const botMessage = { role: "bot", content: this.response };
        this.log.push(botMessage);
        this.input = "";
        this.response = "";
      });
    },
    async completionCall(input) {
      this.messages.push({ role: "user", content: input });
      const configuration = new Configuration({
        apiKey: process.env.VUE_APP_OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      this.isLoading = true;
      this.isBotMessageVisible = false;

      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: this.messages,
        });

        // Check if loading was stopped while the API call was in progress
        if (!this.isLoading) {
          return;
        }

        this.response = completion.data.choices[0].message.content;
        console.log(completion.data.choices[0].message.content);
      } catch (error) {
        // Handleerror if necessary
        console.error(error);
      } finally {
        this.isLoading = false;
        this.isBotMessageVisible = true;
        
      }
    },
    async generateResponse() {
  const userMessage = { role: "user", content: this.input };
  this.log.push(userMessage); // Add user's message to the conversation
  this.scrollToBottom();

  this.isLoading = true;
  this.isBotMessageVisible = false;

  await this.completionCall(this.input);

  const botMessage = { role: "bot", content: this.response };
  this.log.push(botMessage);

  this.input = "";
  this.response = "";

  this.isLoading = false;
  this.isBotMessageVisible = true;

  setTimeout(() => {
    this.scrollToBottomSmooth(); // Scroll to bottom after pushing bot message
  }, 100); // Adjust the delay as needed
},

    submitForm() {
      if (this.input.trim() !== "") {
        if (!this.isBotMessageLoading && !this.isUserTyping) {
          this.isUserTyping = true;
        }
        if (this.isBotMessageLoading) {
          this.stopLoading();
        } else {
          this.generateResponse();
          this.isUserTyping = false;
          this.clearInput();
        }
      }
    },
    stopLoading() {
      this.isLoading = false;
      this.isBotMessageVisible = true;
      this.response = "";
    },
    scrollToBottom() {
      const chatBody = this.$refs.chatBody;
      chatBody.scrollTop = chatBody.scrollHeight;
      // Hide the "Scroll Down" button after scrolling to the bottom
      this.isScrollDownButtonVisible = false;
    },

    clearInput() {
      this.input = "";
    },
    updateScrollDownButtonVisibility() {
      const chatBody = this.$refs.chatBody;
  this.isScrollDownButtonVisible =
    chatBody.scrollTop < chatBody.scrollHeight - chatBody.clientHeight;
    },
    scrollToBottomSmooth() {
      const chatBody = this.$refs.chatBody;
    const startScroll = chatBody.scrollTop;
    const targetScroll = chatBody.scrollHeight - chatBody.clientHeight;

    const duration = 300; // Animation duration in milliseconds
    const startTime = performance.now();

    const animateScroll = (timestamp) => {
      const currentTime = timestamp - startTime;
      const scrollAmount = this.easeInOutQuad(currentTime, startScroll, targetScroll - startScroll, duration);
      chatBody.scrollTop = scrollAmount;

      if (currentTime < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        // Ensure scrolling reaches the exact target at the end of the animation
        chatBody.scrollTop = targetScroll;
      }
    };

    // Start the animation
    requestAnimationFrame(animateScroll);
  },

  easeInOutQuad: function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  },
  },
  watch: {
    reversedLog: "checkChatAtBottom",
  },
});
</script>

<style>
.card {
  height: 100vh;
  font-family: "Roboto", Arial, sans-serif;
}

#input-btn {
  margin-left: 5vw;
  border: none;
}

.chat-body {
  position: relative;
  overflow-y: scroll;
  height: 75vh;
}

.rounded-circle {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.custom-rounded-circle {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 10px;
}

.message-container {
  margin-bottom: 20px;
  font-family: "Roboto", Arial, sans-serif;
  font-weight: bold;
}

.down-btn button {
  background-color: transparent;
  border: none;
  margin-right: 10px;
  position: fixed;
  bottom: 80px;
  right: 10px;
}

.custom-card-header {
  background: linear-gradient(to right, #094fa3, #2f7ec9);
  color: white;
  height: 10vh;
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.custom-card-header h5 {
  margin: 0;
}

.form-control {
  border: 0;
  position: relative;
  height: 20px;
  resize: none;
  font-weight: bold;
}

.form-control:focus {
  border-color: transparent;
  box-shadow: inset 0px 0px 0px 1px transparent;
}

.card-footer {
  height: auto;
  border-width: 2px;
}

.bounce-out-enter-active {
  animation: bounce-out 0.5s;
}

@keyframes bounce-out {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>
