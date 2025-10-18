<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useReviews } from '@/composables/use-reviews';
import ReviewCard from '@/components/ReviewCard.vue';
import AddReviewForm from '@/components/AddReviewForm.vue';
import type { AddReviewCommand } from '@/app/add-review';

const {
  reviews,
  totalCount,
  loading,
  adding,
  error,
  fetchReviews,
  addReview,
} = useReviews();

const showForm = ref(false);
const formRef = ref<InstanceType<typeof AddReviewForm> | null>(null);
const successMessage = ref<string | null>(null);

const handleToggleForm = () => {
  showForm.value = !showForm.value;
  successMessage.value = null;
  if (!showForm.value && formRef.value) {
    formRef.value.resetForm();
  }
};

const handleSubmit = async (command: AddReviewCommand) => {
  successMessage.value = null;
  await addReview(command);

  if (!error.value) {
    successMessage.value = 'Review added successfully!';
    showForm.value = false;
    if (formRef.value) {
      formRef.value.resetForm();
    }
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  }
};

const handleCancel = () => {
  showForm.value = false;
  successMessage.value = null;
  if (formRef.value) {
    formRef.value.resetForm();
  }
};

onMounted(() => {
  // Initial load
  fetchReviews();
});
</script>

<template>
  <section class="page">
    <header class="page__header">
      <h1>Reviews</h1>
      <button
        @click="handleToggleForm"
        class="btn btn--add"
        :disabled="loading"
      >
        {{ showForm ? 'Cancel' : '+ Add Review' }}
      </button>
    </header>

    <div v-if="!loading" class="page__meta" aria-live="polite">
      <span v-if="totalCount > 0">{{ totalCount }} total</span>
      <span v-else>None yet</span>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Add Review Form -->
    <AddReviewForm
      v-if="showForm"
      ref="formRef"
      :is-submitting="adding"
      :error="error"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <div v-if="loading" class="state">Loading…</div>
    <div v-else-if="error" class="state state--error">{{ error }}</div>
    <div v-else>
      <ul v-if="reviews.length" class="grid" role="list">
        <li v-for="r in reviews" :key="r.id" class="grid__item">
          <ReviewCard :review="r" />
        </li>
      </ul>
      <p v-else class="state">No reviews yet. Be the first!</p>
    </div>
  </section>
</template>

<style scoped>
.page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.page__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.page__meta {
  color: #6b7280; /* gray-500 */
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--add {
  background-color: #3b82f6;
  color: white;
}

.btn--add:hover:not(:disabled) {
  background-color: #2563eb;
}

.success-message {
  padding: 1rem;
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 6px;
  color: #065f46;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.grid__item {
  display: block;
}
.state {
  color: #374151; /* gray-700 */
}
.state--error {
  color: #b91c1c; /* red-700 */
}
</style>
