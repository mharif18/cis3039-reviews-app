import type {
  Review,
  ReviewService,
  AddReviewInput,
  AddReviewOutput,
  ListReviewsOutput,
} from '../app/review-service';

/**
 * A simple in-memory implementation of ReviewService for development/testing.
 */
export class FakeReviewService implements ReviewService {
  private items: Review[];
  private idCounter: number;

  constructor(initial: ReadonlyArray<Review> = []) {
    this.items = [...initial];
    this.idCounter = initial.length;
  }

  async listReviews(): Promise<ListReviewsOutput> {
    // Return a shallow copy to avoid external mutation
    return {
      reviews: [...this.items],
      totalCount: this.items.length,
    };
  }

  async addReview(input: AddReviewInput): Promise<AddReviewOutput> {
    const review: Review = {
      id: this.nextId(),
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      createdAt: new Date(),
    };
    // Newest first
    this.items.unshift(review);
    return { review };
  }

  private nextId(): string {
    this.idCounter += 1;
    return `r_${this.idCounter}`;
  }
}
