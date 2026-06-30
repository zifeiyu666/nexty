import "server-only";

import { getMarkdownLinkAttributes } from "@/lib/cms/link-attributes";
import type { Element, Root } from "hast";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, {
  defaultSchema,
  type Options as SanitizeSchema,
} from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractText(node: Element): string {
  let out = "";
  for (const child of node.children) {
    if (child.type === "text") out += child.value;
    else if (child.type === "element") out += extractText(child);
  }
  return out;
}

function rehypeHeadingIds() {
  return (tree: Root) => {
    const seen = new Map<string, number>();
    visit(tree, "element", (node: Element) => {
      if (!["h2", "h3", "h4"].includes(node.tagName)) return;
      const text = extractText(node);
      let id = slugify(text);
      if (!id) return;
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;
      node.properties = { ...(node.properties ?? {}), id };
      node.properties.className = ["scroll-mt-20"];
    });
  };
}

function buildFigure(img: {
  src?: string;
  alt?: string;
  caption?: string;
  link?: string;
}): Element {
  const imageEl: Element = {
    type: "element",
    tagName: "img",
    properties: {
      src: img.src,
      alt: img.alt ?? "",
      loading: "lazy",
      className: ["max-w-full", "max-h-full", "object-contain"],
    },
    children: [],
  };

  const imageWrapper: Element = {
    type: "element",
    tagName: "div",
    properties: {
      className: [
        "relative",
        "overflow-hidden",
        "rounded-xl",
        "bg-background",
        "flex",
        "items-center",
        "justify-center",
      ],
      style: "aspect-ratio:1/1",
    },
    children: [imageEl],
  };

  const inner: Element =
    img.link && /^https?:\/\//i.test(img.link)
      ? {
          type: "element",
          tagName: "a",
          properties: {
            href: img.link,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          children: [imageWrapper],
        }
      : imageWrapper;

  const children: Element[] = [inner];
  if (img.caption && img.caption.trim().length > 0) {
    children.push({
      type: "element",
      tagName: "figcaption",
      properties: {
        className: ["text-sm", "text-muted-foreground", "mt-2", "text-center"],
      },
      children: [{ type: "text", value: img.caption }],
    });
  }

  return {
    type: "element",
    tagName: "figure",
    properties: { className: ["m-0"] },
    children,
  };
}

function clampColumns(n: number): 2 | 3 | 4 {
  if (n === 3) return 3;
  if (n === 4) return 4;
  return 2;
}

function rehypeImageGrid() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "div") return;
      const props = node.properties ?? {};
      if (props.dataType !== "image-grid") return;

      const raw = props.dataImages;
      if (typeof raw !== "string") return;
      let images: Array<{
        src?: string;
        alt?: string;
        caption?: string;
        link?: string;
      }>;
      try {
        images = JSON.parse(raw);
      } catch {
        return;
      }
      if (!Array.isArray(images) || images.length === 0) return;

      const columnsRaw = props.dataColumns;
      const columns = clampColumns(
        typeof columnsRaw === "string"
          ? parseInt(columnsRaw, 10)
          : typeof columnsRaw === "number"
            ? columnsRaw
            : 2,
      );
      const gridClass = `grid gap-3 my-6 grid-cols-1 ${
        columns === 4
          ? "sm:grid-cols-2 md:grid-cols-4"
          : columns === 3
            ? "sm:grid-cols-2 md:grid-cols-3"
            : "sm:grid-cols-2"
      }`;

      const figures: Element[] = images
        .filter((img) => typeof img?.src === "string" && img.src.length > 0)
        .map((img) => buildFigure(img));

      node.tagName = "div";
      node.properties = { className: [gridClass] };
      node.children = figures;
    });
  };
}

function rehypeYoutubeEmbed() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "iframe") return;

      const src = String(node.properties?.src || "");
      if (!src) return;

      const allowedHosts = [
        "www.youtube.com",
        "youtube.com",
        "www.youtube-nocookie.com",
        "youtube-nocookie.com",
      ];

      try {
        const url = new URL(src);
        if (!allowedHosts.includes(url.hostname)) {
          node.tagName = "div";
          node.properties = {
            className:
              "my-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground",
          };
          node.children = [
            {
              type: "text",
              value: "External embed removed for security.",
            },
          ];
          return;
        }
      } catch {
        node.tagName = "div";
        node.properties = {};
        node.children = [];
        return;
      }

      node.properties = {
        ...node.properties,
        allow:
          "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowFullScreen: true,
        loading: "lazy",
        referrerPolicy: "strict-origin-when-cross-origin",
        className:
          "block w-full max-w-full h-auto aspect-video rounded-xl my-4",
      };
    });
  };
}

function rehypeLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;

      const href = String(node.properties?.href || "");
      const linkAttributes = getMarkdownLinkAttributes(
        href,
        node.properties?.rel,
      );
      const nextProperties = {
        ...node.properties,
        ...linkAttributes,
      };

      if (linkAttributes.href === "#") {
        delete nextProperties.target;
        delete nextProperties.rel;
        delete nextProperties.className;
      }

      node.properties = nextProperties;
    });
  };
}

function rehypeResponsiveImages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;

      // Remove fixed width/height so CSS controls responsive sizing
      if (node.properties) {
        delete node.properties.width;
        delete node.properties.height;
      }

      node.properties = {
        ...node.properties,
        className:
          "rounded-md max-w-full h-auto my-4 border border-4 border-primary/10",
      };
    });
  };
}

const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  // Preserve the heading IDs we generate (default schema prefixes them with
  // `user-content-`, which would break TableOfContents scroll anchors).
  clobber: [],
  clobberPrefix: "",
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "figure",
    "figcaption",
    "iframe",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className"],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
    img: [...(defaultSchema.attributes?.img ?? []), "loading"],
    // Default schema restricts h2 className to a single GFM-footnotes value
    // and a tuple wins over the unrestricted form. Override outright so our
    // scroll-mt-20 class survives sanitization.
    h2: ["className"],
    h3: ["className"],
    h4: ["className"],
    iframe: [
      "src",
      "title",
      "width",
      "height",
      "allow",
      "allowFullScreen",
      "loading",
      "referrerPolicy",
      "className",
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ["http", "https"],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeImageGrid)
  .use(rehypeYoutubeEmbed)
  .use(rehypeHeadingIds)
  .use(rehypeLinks)
  .use(rehypeResponsiveImages)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify);

export async function renderPostMarkdown(markdown: string): Promise<string> {
  if (!markdown) return "";
  const file = await processor.process(markdown);
  return String(file);
}
