import type { ReviewService, Review } from './review-service';

/**
 * Use case: List reviews.
 *
 * Contract
 * - Input: a ReviewsService instance (injected)
 * - Output: ListReviewsOutput
 * - Errors: Caught exceptions are converted to a result with errors and empty reviews
 */
export type ListReviewsResult =
  | { success: true; reviews: readonly Review[]; totalCount: number }
  | { success: false; errors: readonly string[] };

export type ListReviewsUseCase = (
  service: ReviewService,
) => Promise<ListReviewsResult>;

/**
 * Lists reviews using the provided ReviewsService.
 *
 * Normalizes the response so callers can safely iterate over `reviews`
 * without null checks (defaults to []).
 */
export const listReviews: ListReviewsUseCase = async (service) => {
  try {
    const { reviews, totalCount } = await service.listReviews();
    return { success: true, reviews, totalCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, errors: [message] };
  }
};
