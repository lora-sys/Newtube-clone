import { StudioLayout } from "@/moubles/studio/layouts/studio-layout"


interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <StudioLayout>
            {children}
        </StudioLayout>
    )
}

export default Layout;