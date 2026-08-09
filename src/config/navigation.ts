export interface NavItem {
  href: string;
  label: string;
  /** Key resolved to a lucide icon in the sidebar. */
  icon:
    | "home"
    | "sparkles"
    | "folder"
    | "file-text"
    | "star"
    | "message-square"
    | "user"
    | "credit-card"
    | "shield";
  exact?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: "home", exact: true },
  { href: "/dashboard/tools", label: "أدوات الذكاء الاصطناعي", icon: "sparkles" },
  { href: "/ai", label: "المحادثة", icon: "message-square" },
  { href: "/dashboard/projects", label: "المشاريع", icon: "folder" },
  { href: "/dashboard/documents", label: "المستندات", icon: "file-text" },
  { href: "/dashboard/favorites", label: "المفضلة", icon: "star" },
];

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/dashboard/settings", label: "الحساب", icon: "user" },
  { href: "/dashboard/subscription", label: "الاشتراك", icon: "credit-card" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "لوحة الإدارة", icon: "shield", exact: true },
];
