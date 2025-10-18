import { inject, ref, type Ref } from 'vue';
import { REVIEWS_KEY, type Reviews } from '../config/appServices';
import type { Review } from '../app/review-service';
import type { AddReviewCommand } from '../app/add-review';

export type UseReviews = {
  // state
  readonly reviews: Ref<readonly Review[]>;
  readonly totalCount: Ref<number>;
  readonly loading: Ref<boolean>;
  readonly adding: Ref<boolean>;
  readonly error: Ref<string | null>;
  // actions
  fetchReviews: () => Promise<void>;
  addReview: (command: AddReviewCommand) => Promise<void>;
};

export function useReviews(): UseReviews {
  const uses = inject<Reviews>(REVIEWS_KEY);
  if (!uses) throw new Error('Reviews not provided');

  const reviews = ref<readonly Review[]>([]);
  const totalCount = ref(0);
  const loading = ref(false);
  const adding = ref(false);
  const error = ref<string | null>(null);

  const fetchReviews = async (): Promise<void> => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const result = await uses.listReviews();
      if (result.success) {
        reviews.value = result.reviews;
        totalCount.value = result.totalCount;
      } else {
        error.value = result.errors.join('; ');
        reviews.value = [];
        totalCount.value = 0;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      reviews.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const add = async (command: AddReviewCommand): Promise<void> => {
    if (adding.value) return;
    adding.value = true;
    error.value = null;
    try {
      const result = await uses.addReview(command);
      if (result.success) {
        // Prepend the new review for a "newest first" UI; keep immutable array for safety
        reviews.value = [result.review, ...reviews.value];
        totalCount.value = Math.max(totalCount.value + 1, reviews.value.length);
      } else {
        error.value = result.errors.join('; ');
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      adding.value = false;
    }
  };

  return {
    reviews,
    totalCount,
    loading,
    adding,
    error,
    fetchReviews,
    addReview: add,
  };
}
