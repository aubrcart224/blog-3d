import { SidebarProvider } from "@/components/ui/sidebar"
import { MainNav } from "@/components/main-nav"
import DynamicThreeCanvas from '@/components/DynamicThreeCanvas'

export const metadata = {
  // ... existing metadata
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <SidebarProvider>
          <div className="flex h-screen">
            <MainNav />
            <main className="flex-1 overflow-hidden">
              <div className="relative h-screen">
                <DynamicThreeCanvas />
                <div className="relative z-10 h-full overflow-auto">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}

