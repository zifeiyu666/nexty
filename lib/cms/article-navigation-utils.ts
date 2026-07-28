import type { FooterLink, HeaderLink } from "@/types/common";

export function isArticlesHeaderLink(link: HeaderLink) {
  return link.id === "articles";
}

export function isArticlesFooterGroup(group: FooterLink) {
  return group.id === "articles";
}
