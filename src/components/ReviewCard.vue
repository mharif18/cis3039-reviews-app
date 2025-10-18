<script setup lang="ts">
import type { Review } from '@/app/review-service';

const props = defineProps<{
  review: Review;
}>();

function formatDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return d.toISOString();
  }
}
</script>

<template>
  <article class="card">
    <header class="card__header">
      <div class="card__title">{{ props.review.title }}</div>
      <div
        class="card__rating"
        :aria-label="`Rating: ${props.review.rating} / 5`"
      >
        <span
          v-for="i in 5"
          :key="i"
          class="star"
          :class="{ filled: i <= props.review.rating }"
          >★</span
        >
        <span class="sr-only">{{ props.review.rating }} out of 5</span>
      </div>
    </header>
    <p class="card__comment">{{ props.review.comment }}</p>
    <footer class="card__footer">
      <time :dateTime="props.review.createdAt.toISOString()">{{
        formatDate(props.review.createdAt)
      }}</time>
      <span class="card__id">#{{ props.review.id }}</span>
    </footer>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.card__title {
  font-weight: 600;
  font-size: 1.05rem;
}
.card__rating {
  color: #f59e0b; /* amber-500 */
  white-space: nowrap;
}
.star {
  opacity: 0.25;
  font-size: 0.95rem;
}
.star.filled {
  opacity: 1;
}
.card__comment {
  color: #374151; /* gray-700 */
  line-height: 1.5;
  margin: 0.25rem 0 0.75rem;
}
.card__footer {
  display: flex;
  gap: 0.75rem;
  color: #6b7280; /* gray-500 */
  font-size: 0.85rem;
}
.card__id {
  margin-left: auto;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
