<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import type { AddReviewCommand } from '../app/add-review';

const emit = defineEmits<{
  submit: [command: AddReviewCommand];
  cancel: [];
}>();

const props = defineProps<{
  isSubmitting?: boolean;
  error?: string | null;
}>();

const form = reactive({
  rating: 5,
  title: '',
  comment: '',
});

const validationErrors = ref<Record<string, string>>({});
const touched = reactive({
  rating: false,
  title: false,
  comment: false,
});

const validate = (): boolean => {
  const errors: Record<string, string> = {};

  if (form.rating < 1 || form.rating > 5) {
    errors.rating = 'Rating must be between 1 and 5';
  }

  const title = form.title.trim();
  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (title.length > 100) {
    errors.title = 'Title must be no more than 100 characters';
  }

  const comment = form.comment.trim();
  if (!comment) {
    errors.comment = 'Comment is required';
  } else if (comment.length < 10) {
    errors.comment = 'Comment must be at least 10 characters';
  } else if (comment.length > 500) {
    errors.comment = 'Comment must be no more than 500 characters';
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const isValid = computed(() => {
  return (
    form.rating >= 1 &&
    form.rating <= 5 &&
    form.title.trim().length >= 3 &&
    form.title.trim().length <= 100 &&
    form.comment.trim().length >= 10 &&
    form.comment.trim().length <= 500
  );
});

const handleSubmit = () => {
  touched.rating = true;
  touched.title = true;
  touched.comment = true;

  if (!validate()) return;

  emit('submit', {
    rating: form.rating,
    title: form.title.trim(),
    comment: form.comment.trim(),
  });
};

const handleCancel = () => {
  emit('cancel');
};

const resetForm = () => {
  form.rating = 5;
  form.title = '';
  form.comment = '';
  validationErrors.value = {};
  touched.rating = false;
  touched.title = false;
  touched.comment = false;
};

const markTouched = (field: keyof typeof touched) => {
  touched[field] = true;
  validate();
};

defineExpose({ resetForm });
</script>

<template>
  <div class="add-review-form">
    <h2>Add Your Review</h2>

    <form @submit.prevent="handleSubmit">
      <!-- Rating -->
      <div class="form-group">
        <label for="rating">Rating</label>
        <div class="rating-input">
          <div class="stars">
            <label
              v-for="star in 5"
              :key="star"
              class="star-label"
              :class="{ active: star <= form.rating }"
            >
              <input
                type="radio"
                name="rating"
                :value="star"
                v-model.number="form.rating"
                @change="markTouched('rating')"
              />
              <span class="star">★</span>
            </label>
          </div>
          <span class="rating-value">{{ form.rating }} / 5</span>
        </div>
        <span v-if="touched.rating && validationErrors.rating" class="error">
          {{ validationErrors.rating }}
        </span>
      </div>

      <!-- Title -->
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          type="text"
          v-model="form.title"
          @blur="markTouched('title')"
          placeholder="Brief summary of your review"
          maxlength="100"
          :disabled="isSubmitting"
        />
        <span class="char-count">{{ form.title.length }} / 100</span>
        <span v-if="touched.title && validationErrors.title" class="error">
          {{ validationErrors.title }}
        </span>
      </div>

      <!-- Comment -->
      <div class="form-group">
        <label for="comment">Comment</label>
        <textarea
          id="comment"
          v-model="form.comment"
          @blur="markTouched('comment')"
          placeholder="Share your detailed experience..."
          rows="5"
          maxlength="500"
          :disabled="isSubmitting"
        ></textarea>
        <span class="char-count">{{ form.comment.length }} / 500</span>
        <span v-if="touched.comment && validationErrors.comment" class="error">
          {{ validationErrors.comment }}
        </span>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="form-error">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button
          type="button"
          @click="handleCancel"
          class="btn btn-secondary"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!isValid || isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-review-form {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-review-form h2 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #111827;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star-label {
  cursor: pointer;
  transition: transform 0.1s;
}

.star-label:hover {
  transform: scale(1.1);
}

.star-label input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.star {
  font-size: 2rem;
  color: #d1d5db;
  transition: color 0.2s;
}

.star-label.active .star {
  color: #fbbf24;
}

.rating-value {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

input[type='text'],
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

input[type='text']:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input[type='text']:disabled,
textarea:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: right;
}

.error {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.form-error {
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

@media (max-width: 640px) {
  .add-review-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
