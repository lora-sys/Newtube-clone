import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainSection } from "./main-section";
import { Separator } from "@/components/ui/separator";
import { PersonalSection } from "./personal-section";
import { SubscriptionsSidebarSection } from "@/moubles/subscriptions/ui/sections/subscriptions-sidebar-section";

export const HomeSidebar = () => {
  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon" >
      <SidebarContent className="bg-background">
        <MainSection/>
        <Separator/>
        <SubscriptionsSidebarSection />
        <Separator/>
        <PersonalSection/>
      </SidebarContent>
    </Sidebar>
  );
};
