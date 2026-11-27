"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  GitBranch,
  LayoutDashboard,
  Languages,
  ShieldCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type Locale = "en" | "pt";

const navigation = {
  en: {
    overview: "Overview",
    workspace: "Workspace",
    dashboard: "Dashboard",
    docs: "Documentation",
    rules: "Rules",
    agents: "Agents",
    workflows: "Workflows",
    language: "Language",
  },
  pt: {
    overview: "Visão geral",
    workspace: "Espaço de trabalho",
    dashboard: "Painel",
    docs: "Documentação",
    rules: "Regras",
    agents: "Agentes",
    workflows: "Fluxos de trabalho",
    language: "Idioma",
  },
};

const items = [
  { key: "dashboard", path: "", icon: LayoutDashboard },
  { key: "docs", path: "/docs", icon: BookOpen },
  { key: "rules", path: "/rules", icon: ShieldCheck },
  { key: "agents", path: "/agents", icon: Bot },
  { key: "workflows", path: "/workflows", icon: GitBranch },
] as const;

export function AppShell({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const labels = navigation[lang];
  const basePath = `/${lang}`;
  const otherLocale: Locale = lang === "en" ? "pt" : "en";
  const translatedPath = pathname.replace(/^\/(en|pt)(?=\/|$)/, `/${otherLocale}`);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href={basePath} className="flex items-center gap-2 font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span>PP</span>
            </div>
            <span className="group-data-[collapsible=icon]:hidden">
              Project Pedro
            </span>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{labels.overview}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.slice(0, 1).map((item) => {
                  const href = `${basePath}${item.path}`;
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        render={<Link href={href} />}
                        isActive={pathname === href}
                        tooltip={labels[item.key]}
                      >
                        <Icon />
                        <span>{labels[item.key]}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{labels.workspace}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.slice(1).map((item) => {
                  const href = `${basePath}${item.path}`;
                  const Icon = item.icon;
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        render={<Link href={href} />}
                        isActive={active}
                        tooltip={labels[item.key]}
                      >
                        <Icon />
                        <span>{labels[item.key]}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href={translatedPath} />}
                tooltip={`${labels.language}: ${otherLocale.toUpperCase()}`}
              >
                <Languages />
                <span>
                  {labels.language}: {otherLocale.toUpperCase()}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <div className="text-sm font-medium">Project Pedro</div>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
