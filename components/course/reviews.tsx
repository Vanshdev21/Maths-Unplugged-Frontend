"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Avatar, Badge, Stars } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useAddReviewReplyMutation } from "@/redux/api/courseApi";
import { useAuth } from "@/redux/hooks";
import { authorOf, getErrorMessage, timeAgo } from "@/lib/utils";
import type { Review } from "@/lib/types";

function ReplyForm({ courseId, reviewId }: { courseId: string; reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [addReply, { isLoading }] = useAddReviewReplyMutation();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 text-sm font-medium text-muted hover:text-fg">
        Reply as teacher
      </button>
    );
  }

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        try {
          await addReply({ courseId, reviewId, reply: reply.trim() }).unwrap();
          toast.success("Reply posted");
          setReply("");
          setOpen(false);
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      <Textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply" aria-label="Reply" />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isLoading}>
          Post reply
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ReviewList({ reviews, courseId }: { reviews: Review[]; courseId: string }) {
  const { isAdmin } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const sorted = [...reviews].reverse();
  const visible = showAll ? sorted : sorted.slice(0, 6);

  if (!reviews.length) {
    return <p className="text-muted">No reviews yet. Enrolled students can rate the course from the lesson page.</p>;
  }

  return (
    <div>
      <ul className="divide-y divide-border">
        {visible.map((review) => {
          const author = authorOf(review.user);
          return (
            <li key={review._id} className="py-6 first:pt-0">
              <div className="flex items-center gap-3">
                <Avatar name={author.name} src={author.avatar} size={38} />
                <div>
                  <p className="text-sm font-semibold">{author.name}</p>
                  <div className="flex items-center gap-2">
                    <Stars value={review.rating} size={13} />
                    {review.createdAt && <span className="text-xs text-subtle">{timeAgo(review.createdAt)}</span>}
                  </div>
                </div>
              </div>
              <p className="mt-3 leading-relaxed whitespace-pre-line">{review.comment}</p>

              {review.commentReplies?.map((reply) => {
                const r = authorOf(reply.user);
                return (
                  <div key={reply._id} className="mt-4 ml-5 border-l-2 border-brand-line pl-4">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {r.name} {r.role === "admin" && <Badge tone="dark">Teacher</Badge>}
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-muted">{reply.comment}</p>
                  </div>
                );
              })}

              {isAdmin && <ReplyForm courseId={courseId} reviewId={review._id} />}
            </li>
          );
        })}
      </ul>
      {sorted.length > 6 && (
        <Button variant="outline" className="mt-4" onClick={() => setShowAll((s) => !s)}>
          {showAll ? "Show fewer reviews" : `Show all ${sorted.length} reviews`}
        </Button>
      )}
    </div>
  );
}
