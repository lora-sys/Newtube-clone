import {SidebarTrigger} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { SearchInput } from "./search-input"
import { AuthButton } from "@/moubles/auth/ui/components/auth-button"
export const HomeNavbar = () => {
    return (
       <nav className="flex top-0 left-0 right-0 bg-white items-center px-2 pr-5 fixed z-50">
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center flex-shrink-0">
            <SidebarTrigger/> 
            <Link href="/">
            {/** logo and menu */}
            <div className="flex items-center gap-1">
           <Image src="/logo.svg" alt="logo" width={32} height={32} />
           <p className="font-semibold text-xl tracking-tight ">Newtube</p>     
            </div>
            </Link> 
            </div>
            {/** search bar */}
             <div className="flex flex-1 justify-center max-w-[720px] mx-auto">
             <SearchInput/>
             </div>

            <div className="flex-shrink-0 items-center flex gap-4">
             <AuthButton/>
            </div>


        </div>
       </nav> 
    )
}