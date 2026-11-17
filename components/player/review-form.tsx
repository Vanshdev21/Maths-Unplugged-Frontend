"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Stars } from "@/components/ui/misc";
import { useAddReviewMutation, useGetCourseQuery } from "@/redux/api/courseApi";
import { useAuth } from "@/redux/hooks";
import { authorOf, cn, getErrorMessage, getUserId } from "@/lib/utils";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const { data, isLoading: loadingCourse } = useGetCourseQuery(courseId);
  const [addReview, { isLoading }] = useAddReviewMutation();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const mine = data?.course.reviews?.find((r) => authorOf(r.user).id === getUserId(user));

  if (loadingCourse) return null;

  if (mine) {
    return (
      <div className="rounded-2xl border border-border p-6">
        <p className="text-sm text-muted">Your review</p>
        <Stars value={mine.rating} size={18} className="mt-2" />
        <p className="mt-3 leading-relaxed whitespace-pre-line">{mine.comment}</p>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form
      className="max-w-xl space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!rating) {
          toast.error("Choose a star rating first");
          return;
        }
        if (!review.trim()) {
          toast.error("Add a few words about the course");
          return;
        }
        try {
          await addReview({ courseId, rating, review: review.trim() }).unwrap();
          toast.success("Thanks! Your review is live.");
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      <fieldset>
        <legend className="text-sm font-medium">How would you rate this course?</legend>
        <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}, ${LABELS[n]}`}
              aria-pressed={rating === n}
              className="rounded-md p-1"
            >
              <Star className={cn("h-7 w-7 transition", n <= shown ? "fill-brand text-brand-line" : "text-border")} />
            </button>
          ))}
          <span className="ml-3 text-sm text-muted">{LABELS[shown]}</span>
        </div>
      </fieldset>
      <Textarea
        rows={4}
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="What did you find most useful? What could be better?"
        aria-label="Your review"
        maxLength={1500}
      />
      <Button type="submit" loading={isLoading}>
        Submit review
      </Button>
    </form>
  );
}
