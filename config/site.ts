export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Red apuntes",
  description:
    "El sitio donde puedes encontrar todos los recursos que nesecitas para tu vida universitaria.",
  navMenuItems: [
    {
      label: "Mi perfil",
      href: "/profile",
    },
    {
      label: "Buscar",
      href: "/search",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
};
