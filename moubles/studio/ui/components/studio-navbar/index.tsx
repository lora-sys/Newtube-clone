import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { AuthButton } from "@/moubles/auth/ui/components/auth-button";
import { StudioUploadModal } from "../studio-upload-modal/studio-upload-modal";
export const StudioNavbar = () => {
  return (
    <nav className="flex top-0 left-0 right-0 bg-white items-center px-2 pr-5 fixed z-50 border-b shadow-md">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link href="/studio">
            {/** logo and menu */}
            <div className="flex items-center gap-1">
              <Image src="/logo.svg" alt="logo" width={32} height={32} />
              <p className="font-semibold text-xl tracking-tight ">Studio</p>
            </div>
          </Link>
        </div>

         {/** spacer */}
         <div className="flex-1"/>

        <div className="flex-shrink-0 items-center flex gap-4">
          <StudioUploadModal/>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
