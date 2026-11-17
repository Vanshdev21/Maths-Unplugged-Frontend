"use client";

import { useState } from "react";
import { MessageSquareReply } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useAddQuestionMutation, useAddReplyMutation } from "@/redux/api/courseApi";
import { useAuth } from "@/redux/hooks";
import { authorOf, getErrorMessage, timeAgo } from "@/lib/utils";
import type { CourseComment, Lesson } from "@/lib/types";

function Author({ comment, size = 34 }: { comment: CourseComment; size?: number }) {
  const a = authorOf(comment.user);
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={a.name} src={a.avatar} size={size} />
      <p className="flex flex-wrap items-center gap-x-2 text-sm">
        <span className="font-semibold">{a.name}</span>
        {a.role === "admin" && <Badge tone="dark">Teacher</Badge>}
        {comment.createdAt && <span className="text-xs text-subtle">{timeAgo(comment.createdAt)}</span>}
      </p>
    </div>
  );
}

function ReplyBox({ courseId, contentId, questionId, onDone }: { courseId: string; contentId: string; questionId: string; onDone: () => void }) {
  const [reply, setReply] = useState("");
  const [addReply, { isLoading }] = useAddReplyMutation();
  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        try {
          await addReply({ courseId, contentId, questionId, reply: reply.trim() }).unwrap();
          toast.success("Reply posted");
          setReply("");
          onDone();
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      <Textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply" aria-label="Your reply" autoFocus />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isLoading} disabled={!reply.trim()}>
          Post reply
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function QnA({ courseId, lesson }: { courseId: string; lesson: Lesson }) {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [addQuestion, { isLoading }] = useAddQuestionMutation();
  const questions = [...(lesson.questions ?? [])].reverse();

  return (
    <div className="space-y-8">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!question.trim()) return;
          try {
            await addQuestion({ courseId, contentId: lesson._id, question: question.trim() }).unwrap();
            toast.success("Question posted. You'll get an email when someone replies.");
            setQuestion("");
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        }}
      >
        <div className="flex gap-3">
          <Avatar name={user?.name} src={user?.avatar?.url} size={36} />
          <Textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Stuck on something in this lesson? Describe where you got lost."
            aria-label="Ask a question about this lesson"
            maxLength={2000}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={isLoading} disabled={!question.trim()}>
            Post question
          </Button>
        </div>
      </form>

      {questions.length === 0 ? (
        <p className="rounded-xl bg-surface px-5 py-6 text-center text-sm text-muted">No questions on this lesson yet. Be the first to ask.</p>
      ) : (
        <ul className="divide-y divide-border">
          {questions.map((q) => (
            <li key={q._id} className="py-6 first:pt-0">
              <Author comment={q} />
              <p className="mt-2.5 pl-[46px] leading-relaxed whitespace-pre-line">{q.comment}</p>

              {!!q.commentReplies?.length && (
                <ul className="mt-4 ml-[46px] space-y-4 border-l-2 border-border pl-4">
                  {q.commentReplies.map((r) => (
                    <li key={r._id}>
                      <Author comment={r} size={28} />
                      <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-fg/85">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pl-[46px]">
                {replyingTo === q._id ? (
                  <ReplyBox courseId={courseId} contentId={lesson._id} questionId={q._id} onDone={() => setReplyingTo(null)} />
                ) : (
                  <button
                    type="button"
                    onClick={() => setReplyingTo(q._id)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg"
                  >
                    <MessageSquareReply className="h-4 w-4" aria-hidden /> Reply
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
