import HeaderLinks from "@/components/header/HeaderLinks";
import MobileMenu from "@/components/header/MobileMenu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getHeaderNavigationLinks } from "@/lib/cms/article-navigation";
import { getLocale } from "next-intl/server";

export default async function SidebarInsetHeader() {
  const locale = await getLocale();
  const headerLinks = await getHeaderNavigationLinks(locale);

  return (
    <header className="w-full py-2 px-4 backdrop-blur-md sticky top-0 z-50">
      <nav className="flex justify-between items-center w-full mx-auto">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <HeaderLinks links={headerLinks} />
        </div>

        <div className="flex items-center gap-x-2 flex-1 justify-end">
          <div className="flex lg:hidden">
            <MobileMenu links={headerLinks} />
          </div>
        </div>
      </nav>
    </header>
  );
}
