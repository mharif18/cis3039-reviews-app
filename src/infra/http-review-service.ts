import type {
  Review,
  ReviewService,
  AddReviewInput,
  AddReviewOutput,
  ListReviewsOutput,
} from '../app/review-service';

type ReviewDto = {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
};

type ListReviewsResponseDto =
  | { reviews?: ReviewDto[]; totalCount?: number; errors?: string[] }
  | ReviewDto[];

type AddReviewResponseDto = { review?: ReviewDto; errors?: string[] };

export type HttpClient = typeof fetch;

export type HttpReviewServiceOptions = {
  readonly baseUrl?: string;
  readonly http?: HttpClient;
  readonly headers?: Record<string, string>;
};

export class HttpReviewService implements ReviewService {
  private readonly baseUrl?: string;
  private readonly http: HttpClient;
  private readonly headers: Record<string, string>;

  constructor(options: HttpReviewServiceOptions = {}) {
    this.baseUrl = options.baseUrl
      ? options.baseUrl.replace(/\/$/, '')
      : undefined;
    // Ensure fetch is properly bound to a global target to avoid illegal invocation errors
    const rawHttp: HttpClient | undefined =
      options.http ?? (typeof fetch !== 'undefined' ? fetch : undefined);
    if (!rawHttp) {
      throw new Error('No fetch implementation available');
    }
    const target: any = typeof window !== 'undefined' ? window : globalThis;
    this.http = (rawHttp as any).bind(target);
    this.headers = { ...(options.headers ?? {}) };
  }

  async listReviews(): Promise<ListReviewsOutput> {
    const res = await this.http(this.url('/reviews'), {
      method: 'GET',
      headers: this.mergeHeaders({ Accept: 'application/json' }),
    });
    await this.ensureOk(res);
    const body = (await this.parseJson(res)) as ListReviewsResponseDto;

    const errors = Array.isArray(body)
      ? undefined
      : Array.isArray(body.errors)
        ? body.errors
        : undefined;
    if (errors && errors.length) throw new Error(errors.join('; '));

    const reviews = Array.isArray(body)
      ? body
      : Array.isArray(body.reviews)
        ? body.reviews
        : [];
    const mapped = reviews.map(toDomainReview);
    const totalCount = Array.isArray(body)
      ? mapped.length
      : typeof body.totalCount === 'number'
        ? body.totalCount
        : mapped.length;
    return { reviews: mapped, totalCount };
  }

  async addReview(input: AddReviewInput): Promise<AddReviewOutput> {
    const dto = toAddReviewRequestDto(input);
    const res = await this.http(this.url('/reviews'), {
      method: 'POST',
      headers: this.mergeHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(dto),
    });
    await this.ensureOk(res);
    const body = (await this.parseJson(res)) as AddReviewResponseDto;
    if (Array.isArray(body.errors) && body.errors.length) {
      throw new Error(body.errors.join('; '));
    }
    const reviewDto = body.review;
    if (!reviewDto || typeof reviewDto !== 'object') {
      throw new Error('Malformed add review response');
    }
    const review = toDomainReview(reviewDto);
    return { review };
  }

  // helpers
  private url(path: string): string {
    if (!this.baseUrl) return path;
    return `${this.baseUrl}${path}`;
  }

  private mergeHeaders(extra: Record<string, string>): Record<string, string> {
    return { ...this.headers, ...extra };
  }

  private async ensureOk(res: Response): Promise<void> {
    if (res.ok) return;
    let message = `${res.status} ${res.statusText}`;
    try {
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const errBody = await res.clone().json();
        const msg = (errBody && (errBody.message || errBody.error)) as
          | string
          | undefined;
        if (msg) message = `${message} - ${msg}`;
      } else {
        const text = await res.clone().text();
        if (text) message = `${message} - ${text.slice(0, 300)}`;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  private async parseJson(res: Response): Promise<unknown> {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON response');
    }
  }
}

// Infra-level request DTO (decoupled from app AddReviewInput)
type AddReviewRequestDto = {
  rating: number;
  title: string;
  comment: string;
};

function toAddReviewRequestDto(input: AddReviewInput): AddReviewRequestDto {
  return {
    rating: input.rating,
    title: input.title,
    comment: input.comment,
  };
}

function toDomainReview(r: ReviewDto): Review {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    createdAt: toDate(r.createdAt),
  };
}

function toDate(v: string): Date {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid createdAt date');
  }
  return d;
}
