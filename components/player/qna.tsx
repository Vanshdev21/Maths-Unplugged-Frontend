"use client";

import { useRef, useState, type ClipboardEvent } from "react";
import Image from "next/image";
import { ImagePlus, MessageSquareReply, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAddQuestionMutation, useAddReplyMutation, useEditCommentMutation } from "@/redux/api/courseApi";
import { useAuth } from "@/redux/hooks";
import { authorOf, compressImage, getErrorMessage, getUserId, timeAgo } from "@/lib/utils";
import type { CommentImage, CourseComment, Lesson } from "@/lib/types";

const MAX_PHOTOS = 3;
const MAX_CHARS = 2000;

/* ---------------------------------------------------------------- photos */

interface Draft {
  id: string;
  dataUrl: string;
}

/** Photos picked for a new question or reply, resized in the browser first. */
function usePhotoDrafts() {
  const [photos, setPhotos] = useState<Draft[]>([]);
  const [busy, setBusy] = useState(false);

  const add = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_PHOTOS} photos.`);
      return;
    }
    if (images.length > room) toast.error(`Only the first ${room} photo${room === 1 ? "" : "s"} were added.`);
    setBusy(true);
    try {
      const resized = await Promise.all(images.slice(0, room).map((f) => compressImage(f, 1600, 0.82, true)));
      setPhotos((prev) => [...prev, ...resized.map((dataUrl) => ({ id: crypto.randomUUID(), dataUrl }))]);
    } catch (err) {
      toast.error(getErrorMessage(err, "That photo couldn't be added."));
    } finally {
      setBusy(false);
    }
  };

  /** Lets people paste a screenshot straight into the text box. */
  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = [...e.clipboardData.files].filter((f) => f.type.startsWith("image/"));
    if (files.length) {
      e.preventDefault();
      void add(files);
    }
  };

  return {
    photos,
    busy,
    add,
    onPaste,
    remove: (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id)),
    clear: () => setPhotos([]),
    dataUrls: photos.map((p) => p.dataUrl),
  };
}

function PhotoDraftStrip({ drafts }: { drafts: ReturnType<typeof usePhotoDrafts> }) {
  if (!drafts.photos.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {drafts.photos.map((p) => (
        <li key={p.id} className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
          <img src={p.dataUrl} alt="Photo to attach" className="h-20 w-20 rounded-lg border border-border object-cover" />
          <button
            type="button"
            onClick={() => drafts.remove(p.id)}
            aria-label="Remove photo"
            className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg text-muted shadow-sm hover:text-fg"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddPhotoButton({ drafts }: { drafts: ReturnType<typeof usePhotoDrafts> }) {
  const input = useRef<HTMLInputElement>(null);
  const full = drafts.photos.length >= MAX_PHOTOS;
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        hidden
        onChange={(e) => {
          void drafts.add([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => input.current?.click()}
        disabled={full || drafts.busy}
        loading={drafts.busy}
        title={full ? `Up to ${MAX_PHOTOS} photos` : "Attach a photo of your working"}
      >
        <ImagePlus className="h-4 w-4" aria-hidden /> Photo
        {drafts.photos.length > 0 && <span className="text-subtle">{drafts.photos.length}/{MAX_PHOTOS}</span>}
      </Button>
    </>
  );
}

function PhotoGrid({ images, small }: { images?: CommentImage[]; small?: boolean }) {
  const [open, setOpen] = useState<CommentImage | null>(null);
  if (!images?.length) return null;
  const size = small ? 96 : 120;
  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2">
        {images.map((img, i) => (
          <li key={img.public_id}>
            <button
              type="button"
              onClick={() => setOpen(img)}
              className="block overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-90 focus-visible:outline-2"
              aria-label={`Open photo ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={`Attached photo ${i + 1}`}
                width={size}
                height={size}
                className="object-cover"
                style={{ width: size, height: size }}
              />
            </button>
          </li>
        ))}
      </ul>
      <Modal open={!!open} onClose={() => setOpen(null)} title="Photo" className="max-w-3xl">
        {open && (
          <a href={open.url} target="_blank" rel="noreferrer" className="block">
            <Image
              src={open.url}
              alt="Attached photo"
              width={open.width ?? 1200}
              height={open.height ?? 900}
              className="h-auto max-h-[75vh] w-full rounded-lg object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </a>
        )}
      </Modal>
    </>
  );
}

/* --------------------------------------------------------------- pieces */

function Author({ comment, size = 34 }: { comment: CourseComment; size?: number }) {
  const a = authorOf(comment.user);
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={a.name} src={a.avatar} size={size} />
      <p className="flex flex-wrap items-center gap-x-2 text-sm">
        <span className="font-semibold">{a.name}</span>
        {a.role === "admin" && <Badge tone="dark">Teacher</Badge>}
        {comment.createdAt && <span className="text-xs text-subtle">{timeAgo(comment.createdAt)}</span>}
        {comment.editedAt && <span className="text-xs text-subtle">(edited)</span>}
      </p>
    </div>
  );
}

interface Target {
  courseId: string;
  contentId: string;
  questionId: string;
  replyId?: string;
}

function EditForm({ comment, target, onDone }: { comment: CourseComment; target: Target; onDone: () => void }) {
  const [text, setText] = useState(comment.comment);
  const [removed, setRemoved] = useState<string[]>([]);
  const [editComment, { isLoading }] = useEditCommentMutation();
  const kept = (comment.images ?? []).filter((img) => !removed.includes(img.public_id));
  const unchanged = text.trim() === comment.comment && removed.length === 0;

  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim() || unchanged) return onDone();
        try {
          await editComment({ ...target, comment: text.trim(), ...(removed.length ? { removeImages: removed } : {}) }).unwrap();
          toast.success("Saved");
          onDone();
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      <Textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX_CHARS}
        aria-label="Edit your comment"
        autoFocus
        onKeyDown={(e) => e.key === "Escape" && onDone()}
      />
      {kept.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {kept.map((img) => (
            <li key={img.public_id} className="relative">
              <Image src={img.url} alt="Attached photo" width={80} height={80} className="h-20 w-20 rounded-lg border border-border object-cover" />
              <button
                type="button"
                onClick={() => setRemoved((r) => [...r, img.public_id])}
                aria-label="Remove this photo"
                className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg text-muted shadow-sm hover:text-fg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isLoading} disabled={!text.trim()}>
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** A question or reply: text, photos, and an Edit button for its author. */
function CommentBody({ comment, target, small }: { comment: CourseComment; target: Target; small?: boolean }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const isMine = !!user && authorOf(comment.user).id === getUserId(user);

  if (editing) return <EditForm comment={comment} target={target} onDone={() => setEditing(false)} />;

  return (
    <div className="group">
      <p className={small ? "mt-2 text-[15px] leading-relaxed whitespace-pre-line text-fg/85" : "mt-2.5 leading-relaxed whitespace-pre-line"}>
        {comment.comment}
      </p>
      <PhotoGrid images={comment.images} small={small} />
      {isMine && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
        </button>
      )}
    </div>
  );
}

function ReplyBox({ courseId, contentId, questionId, onDone }: { courseId: string; contentId: string; questionId: string; onDone: () => void }) {
  const [reply, setReply] = useState("");
  const drafts = usePhotoDrafts();
  const [addReply, { isLoading }] = useAddReplyMutation();
  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        try {
          await addReply({
            courseId,
            contentId,
            questionId,
            reply: reply.trim(),
            ...(drafts.dataUrls.length ? { images: drafts.dataUrls } : {}),
          }).unwrap();
          toast.success("Reply posted");
          setReply("");
          drafts.clear();
          onDone();
        } catch (err) {
          toast.error(getErrorMessage(err));
        }
      }}
    >
      <Textarea
        rows={3}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        onPaste={drafts.onPaste}
        placeholder="Write a reply"
        aria-label="Your reply"
        maxLength={MAX_CHARS}
        autoFocus
      />
      <PhotoDraftStrip drafts={drafts} />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" loading={isLoading} disabled={!reply.trim() || drafts.busy}>
          Post reply
        </Button>
        <AddPhotoButton drafts={drafts} />
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------- main */

export function QnA({ courseId, lesson }: { courseId: string; lesson: Lesson }) {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const drafts = usePhotoDrafts();
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
            await addQuestion({
              courseId,
              contentId: lesson._id,
              question: question.trim(),
              ...(drafts.dataUrls.length ? { images: drafts.dataUrls } : {}),
            }).unwrap();
            toast.success("Question posted. You'll get an email when someone replies.");
            setQuestion("");
            drafts.clear();
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        }}
      >
        <div className="flex gap-3">
          <Avatar name={user?.name} src={user?.avatar?.url} size={36} />
          <div className="min-w-0 flex-1 space-y-2">
            <Textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onPaste={drafts.onPaste}
              placeholder="Stuck on something in this lesson? Describe where you got lost, and add a photo of your working if it helps."
              aria-label="Ask a question about this lesson"
              maxLength={MAX_CHARS}
            />
            <PhotoDraftStrip drafts={drafts} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <AddPhotoButton drafts={drafts} />
          <Button type="submit" size="sm" loading={isLoading} disabled={!question.trim() || drafts.busy}>
            Post question
          </Button>
        </div>
      </form>

      {questions.length === 0 ? (
        <p className="rounded-xl bg-surface px-5 py-6 text-center text-sm text-muted">No questions on this lesson yet. Be the first to ask.</p>
      ) : (
        <ul className="divide-y divide-border">
          {questions.map((q) => {
            const base = { courseId, contentId: lesson._id, questionId: q._id };
            return (
              <li key={q._id} className="py-6 first:pt-0">
                <Author comment={q} />
                <div className="pl-[46px]">
                  <CommentBody comment={q} target={base} />
                </div>

                {!!q.commentReplies?.length && (
                  <ul className="mt-4 ml-[46px] space-y-4 border-l-2 border-border pl-4">
                    {q.commentReplies.map((r) => (
                      <li key={r._id}>
                        <Author comment={r} size={28} />
                        <CommentBody comment={r} target={{ ...base, replyId: r._id }} small />
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
