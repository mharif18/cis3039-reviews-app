<script setup lang="ts">
import { onMounted } from 'vue';
import { useReviews } from '@/composables/use-reviews';
import ReviewCard from '@/components/ReviewCard.vue';

const { reviews, totalCount, loading, error, fetchReviews } = useReviews();

onMounted(() => {
  // Initial load
  fetchReviews();
});
</script>

<template>
  <section class="page">
    <header class="page__header">
      <h1>Reviews</h1>
      <div v-if="!loading" class="page__meta" aria-live="polite">
        <span v-if="totalCount > 0">{{ totalCount }} total</span>
        <span v-else>None yet</span>
      </div>
    </header>

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
  margin-bottom: 1rem;
}
.page__meta {
  color: #6b7280; /* gray-500 */
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
