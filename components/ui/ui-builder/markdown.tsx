/* eslint-disable @next/next/no-img-element */
"use client";

import React, { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "@/components/ui/ui-builder/codeblock";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  className?: string;
  children: string;
}
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <MemoizedReactMarkdown
      className={cn(
        "prose break-words prose-headings:text-secondary-foreground prose-blockquote:text-secondary-foreground prose-strong:text-secondary-foreground prose-p:leading-relaxed prose-pre:p-0 prose-pre:m-1 prose-p:text-base prose-p:font-normal prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:py-0 prose-li:my-0 max-w-none text-secondary-foreground",
        className
      )}
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        a({ children, href, className }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(className, "text-blue-500 hover:text-blue-600")}
            >
              {children}
            </a>
          );
        },
        img({ src, alt, className }) {
          return (
            <img
              src={src}
              alt={alt}
              className={cn(className, "w-full h-auto")}
            />
          );
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          if (match) {
            return (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(children).replace(/\n$/, "")}
                {...props}
              />
            );
          }

          return (
            <code className={cn(className, "whitespace-pre-wrap")} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {children}
    </MemoizedReactMarkdown>
  );
}

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);
