"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/shared/Button";
import { useI18n } from "@/components/shared/I18nProvider";
import { Panel } from "@/components/shared/Panel";
import { TextareaField } from "@/components/shared/TextareaField";

interface InterviewStartFormProps {
  onStart: (values: { firstName: string; lastName: string }) => void;
}

export function InterviewStartForm({ onStart }: InterviewStartFormProps) {
  const { dictionary } = useI18n();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      return;
    }

    onStart({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    });
  }

  return (
    <Panel className="mx-auto my-auto w-full max-w-2xl px-6 py-6 lg:px-8">
      <h1 className="font-serif text-4xl text-foreground">
        {dictionary.interview.startTitle}
      </h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="first-name"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-muted"
            >
              {dictionary.interview.firstName}
            </label>
            <TextareaField
              id="first-name"
              rows={1}
              className="min-h-[64px] resize-none py-4 text-lg leading-7"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="last-name"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-muted"
            >
              {dictionary.interview.lastName}
            </label>
            <TextareaField
              id="last-name"
              rows={1}
              className="min-h-[64px] resize-none py-4 text-lg leading-7"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!firstName.trim() || !lastName.trim()}>
            {dictionary.interview.begin}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
