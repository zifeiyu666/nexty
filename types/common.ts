export interface HeaderLink {
  id?: string;
  name: string;
  href: string;
  target?: string;
  rel?: string;
  items?: HeaderLink[];
  description?: string;
}

export interface FooterLink {
  id?: string;
  title: string;
  links: Link[];
};

interface Link {
  id?: string;
  href?: string;
  name: string;
  target?: string;
  rel?: string;
  useA?: boolean;
  isSubTitle?: boolean;
};
