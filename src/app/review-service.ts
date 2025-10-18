export type Review = {
  readonly id: string;
  readonly rating: number;
  readonly title: string;
  readonly comment: string;
  readonly createdAt: Date;
};

export type ListReviewsOutput = {
  readonly reviews: readonly Review[];
  readonly totalCount: number;
};

export type AddReviewInput = {
  readonly rating: number;
  readonly title: string;
  readonly comment: string;
};

export type AddReviewOutput = {
  readonly review: Review;
};

export interface ReviewService {
  listReviews(): Promise<ListReviewsOutput>;
  addReview(input: AddReviewInput): Promise<AddReviewOutput>;
}
